use tauri::Manager;

pub mod audio_recorder;
pub mod plugins;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    #[cfg(target_os = "linux")]
    {
        if std::env::var("GST_AUDIOSRC").is_err() {
            unsafe { std::env::set_var("GST_AUDIOSRC", "pulsesrc"); }
        }
        if std::env::var("GST_AUDIOSINK").is_err() {
            unsafe { std::env::set_var("GST_AUDIOSINK", "pulsesink"); }
        }
    }

    let mut builder =
        tauri::Builder::default().plugin(tauri_plugin_single_instance::init(|_, _, _| {}));

    // CrabNebula DevTools prevents other logging plugins from working
    // https://docs.crabnebula.dev/devtools/troubleshoot/log-plugins/
    #[cfg(debug_assertions)]
    {
        let devtools = tauri_plugin_devtools::init();
        builder = builder.plugin(devtools);
    }

    #[cfg(not(debug_assertions))]
    {
        builder = builder.plugin(self::plugins::logging::tauri_plugin_logging());
    }
    builder
        .plugin(tauri_plugin_decorum::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .invoke_handler(tauri::generate_handler![
            audio_recorder::start_native_recording,
            audio_recorder::stop_native_recording,
            audio_recorder::read_file_binary,
            audio_recorder::pick_audio_file,
            audio_recorder::save_text_file,
            audio_recorder::save_audio_file,
        ])
        .setup(|app| {
            let _main_window = app.get_webview_window("main").unwrap();

            // Some macOS-specific helpers
            #[cfg(target_os = "macos")]
            {
                // Set a custom inset to the traffic lights
                _main_window.set_traffic_lights_inset(12.0, 16.0).unwrap();

                // Make window transparent without privateApi
                _main_window.make_transparent().unwrap();
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
