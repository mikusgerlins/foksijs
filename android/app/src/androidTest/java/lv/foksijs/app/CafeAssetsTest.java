package lv.foksijs.app;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import android.content.Context;
import androidx.test.ext.junit.runners.AndroidJUnit4;
import androidx.test.platform.app.InstrumentationRegistry;
import java.util.Arrays;
import java.util.List;
import org.junit.Test;
import org.junit.runner.RunWith;

@RunWith(AndroidJUnit4.class)
public class CafeAssetsTest {
    @Test
    public void installedAppContainsCafeLessonMedia() throws Exception {
        Context context = InstrumentationRegistry.getInstrumentation().getTargetContext();
        assertEquals("lv.foksijs.app", context.getPackageName());
        List<String> files = Arrays.asList(context.getAssets().list("public/cafe"));
        for (String clip : new String[] {
            "lv_welcome", "lv_listen", "lv_retry", "lv_correct", "lv_repeat", "lv_order", "lv_done",
            "en_water", "en_water_full", "en_question", "en_juice_full", "en_juice_short"
        }) assertTrue(clip, files.contains(clip + ".wav"));
        for (String image : new String[] { "cafe", "apple", "milk", "water", "host", "apple_order" }) {
            assertTrue(image, files.contains(image + ".jpg"));
        }
    }
}
