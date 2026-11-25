package lv.foksijs.app;

import android.Manifest;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.webkit.PermissionRequest;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.core.content.ContextCompat;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.BridgeWebChromeClient;

public class MainActivity extends BridgeActivity {
    private PermissionRequest pendingMicrophone;
    private boolean microphoneDialogOpen;

    private final ActivityResultLauncher<String> microphonePermission =
        registerForActivityResult(new ActivityResultContracts.RequestPermission(), granted -> {
            microphoneDialogOpen = false;
            PermissionRequest request = pendingMicrophone;
            pendingMicrophone = null;
            if (request == null) return;
            if (granted) request.grant(new String[] { PermissionRequest.RESOURCE_AUDIO_CAPTURE });
            else request.deny();
        });

    @Override
    protected void load() {
        registerPlugin(ProfileProgress.class);
        super.load();
        bridge.getWebView().setWebChromeClient(new BridgeWebChromeClient(bridge) {
            @Override
            public void onPermissionRequest(PermissionRequest request) {
                Uri origin = request.getOrigin();
                String[] resources = request.getResources();
                if (!"https".equals(origin.getScheme()) || !"localhost".equals(origin.getAuthority())
                        || resources.length != 1 || !PermissionRequest.RESOURCE_AUDIO_CAPTURE.equals(resources[0])
                        || microphoneDialogOpen) {
                    request.deny();
                    return;
                }
                if (ContextCompat.checkSelfPermission(MainActivity.this, Manifest.permission.RECORD_AUDIO)
                        == PackageManager.PERMISSION_GRANTED) {
                    request.grant(resources);
                    return;
                }
                pendingMicrophone = request;
                microphoneDialogOpen = true;
                microphonePermission.launch(Manifest.permission.RECORD_AUDIO);
            }

            @Override
            public void onPermissionRequestCanceled(PermissionRequest request) {
                if (pendingMicrophone == request) pendingMicrophone = null;
            }
        });
    }
}
