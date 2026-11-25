package lv.foksijs.app;

import android.content.Context;
import android.content.SharedPreferences;
import android.util.JsonReader;
import android.util.JsonToken;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.IOException;
import java.io.StringReader;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.regex.Pattern;

@CapacitorPlugin(name = "ProfileProgress")
public class ProfileProgress extends Plugin {
    // One queue per process keeps reads and writes ordered even across activity recreation.
    private static final ExecutorService DISK = Executors.newSingleThreadExecutor();
    private static final Pattern PROFILE_ID = Pattern.compile("[a-zA-Z0-9][a-zA-Z0-9_-]{0,63}");

    private SharedPreferences preferences() {
        return getContext().getSharedPreferences("foksijs_profile_progress", Context.MODE_PRIVATE);
    }

    private static boolean validProgress(String value) throws IOException {
        Map<String, JsonToken> required = new HashMap<>();
        required.put("xp", JsonToken.NUMBER);
        required.put("streak", JsonToken.NUMBER);
        required.put("units", JsonToken.BEGIN_OBJECT);
        required.put("mistakes", JsonToken.BEGIN_OBJECT);
        required.put("learnedWords", JsonToken.BEGIN_ARRAY);
        try (JsonReader reader = new JsonReader(new StringReader(value))) {
            if (reader.peek() != JsonToken.BEGIN_OBJECT) return false;
            reader.beginObject();
            while (reader.hasNext()) {
                JsonToken expected = required.remove(reader.nextName());
                if (expected != null && reader.peek() != expected) return false;
                reader.skipValue();
            }
            reader.endObject();
            return required.isEmpty() && reader.peek() == JsonToken.END_DOCUMENT;
        }
    }

    @PluginMethod
    public void getAll(PluginCall call) {
        DISK.execute(() -> {
            try {
                JSObject values = new JSObject();
                for (Map.Entry<String, ?> entry : preferences().getAll().entrySet()) {
                    values.put(entry.getKey(), (String) entry.getValue());
                }
                call.resolve(new JSObject().put("values", values));
            } catch (RuntimeException error) {
                call.reject("Could not read profile progress", error);
            }
        });
    }

    @PluginMethod
    public void set(PluginCall call) {
        String id = call.getString("profileId");
        String value = call.getString("value");
        if (id == null || !PROFILE_ID.matcher(id).matches() || value == null) {
            call.reject("Invalid profile ID or missing progress");
            return;
        }
        DISK.execute(() -> {
            try {
                if (!validProgress(value)) {
                    call.reject("Invalid profile progress");
                    return;
                }
                // The next lesson screen may be followed immediately by a process kill.
                // Acknowledge only after the write has reached the preference file.
                if (preferences().edit().putString(id, value).commit()) call.resolve();
                else call.reject("Could not save profile progress");
            } catch (IOException error) {
                call.reject("Invalid profile progress", error);
            } catch (RuntimeException error) {
                call.reject("Could not save profile progress", error);
            }
        });
    }
}
