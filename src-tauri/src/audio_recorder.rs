use std::path::PathBuf;
use std::process::{Child, Command};
use std::sync::Mutex;

static ACTIVE_PROCESS: Mutex<Option<(Child, PathBuf)>> = Mutex::new(None);

#[tauri::command]
pub fn start_native_recording() -> Result<(), String> {
    let mut guard = ACTIVE_PROCESS.lock().map_err(|e| e.to_string())?;

    // Ensure any previous recording process is stopped
    if let Some((mut old_child, _)) = guard.take() {
        let _ = old_child.kill();
    }

    let temp_dir = std::env::temp_dir();
    let file_name = format!(
        "maina_rec_{}.wav",
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_millis(),
    );
    let file_path = temp_dir.join(file_name);
    let path_str = file_path.to_str().ok_or("Invalid temp path")?.to_string();

    // Try ffmpeg PulseAudio capture first, fallback to ALSA arecord
    let child = Command::new("ffmpeg")
        .args([
            "-y",
            "-f",
            "pulse",
            "-i",
            "default",
            "-ar",
            "16000",
            "-ac",
            "1",
            &path_str,
        ])
        .spawn()
        .or_else(|_| {
            Command::new("arecord")
                .args(["-f", "S16_LE", "-r", "16000", "-c", "1", &path_str])
                .spawn()
        })
        .map_err(|e| format!("Failed to launch native Linux audio recorder (ffmpeg/arecord): {}", e))?;

    *guard = Some((child, file_path));
    Ok(())
}

#[tauri::command]
pub fn stop_native_recording() -> Result<String, String> {
    let mut guard = ACTIVE_PROCESS.lock().map_err(|e| e.to_string())?;
    let (mut child, file_path) = guard
        .take()
        .ok_or_else(|| "No active recording process found".to_string())?;

    // Kill process to close audio stream and finalize WAV file
    let _ = child.kill();
    let _ = child.wait();

    let path_str = file_path.to_string_lossy().to_string();
    Ok(path_str)
}

/// Reads a file from disk and returns its raw bytes.
/// Used by the frontend transcription service to convert WAV recordings
/// into base64 for sending to OpenRouter cloud APIs.
#[tauri::command]
pub fn read_file_binary(path: String) -> Result<Vec<u8>, String> {
    std::fs::read(&path).map_err(|e| format!("Failed to read file '{}': {}", path, e))
}

/// Opens a native file picker for selecting audio files to upload & transcribe.
/// Returns the selected file path, or None if cancelled.
#[tauri::command]
pub fn pick_audio_file() -> Option<String> {
    rfd::FileDialog::new()
        .set_title("Select Audio File to Transcribe")
        .add_filter("Audio Files", &["wav", "mp3", "m4a", "webm", "flac", "ogg", "opus"])
        .pick_file()
        .map(|p| p.to_string_lossy().to_string())
}

/// Opens a native Save file picker and saves text content to disk.
/// Used for exporting transcripts as .txt files.
#[tauri::command]
pub fn save_text_file(content: String, default_name: String) -> Result<String, String> {
    let path = rfd::FileDialog::new()
        .set_title("Save Transcript")
        .set_file_name(&default_name)
        .add_filter("Text File", &["txt"])
        .save_file()
        .ok_or_else(|| "Save cancelled".to_string())?;

    std::fs::write(&path, content)
        .map_err(|e| format!("Failed to save file: {}", e))?;

    Ok(path.to_string_lossy().to_string())
}

/// Opens a native Save file picker and copies a WAV recording to a chosen location.
/// Used for exporting/downloading audio recordings.
#[tauri::command]
pub fn save_audio_file(source_path: String, default_name: String) -> Result<String, String> {
    let path = rfd::FileDialog::new()
        .set_title("Save Audio Recording")
        .set_file_name(&default_name)
        .add_filter("WAV Audio", &["wav"])
        .save_file()
        .ok_or_else(|| "Save cancelled".to_string())?;

    std::fs::copy(&source_path, &path)
        .map_err(|e| format!("Failed to copy audio file: {}", e))?;

    Ok(path.to_string_lossy().to_string())
}
