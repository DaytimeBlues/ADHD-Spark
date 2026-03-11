# Bundled App Audio

Drop the real committed app audio files into this folder using these exact
lowercase filenames:

- `brown_noise.mp3`
- `notification.mp3`
- `completion.mp3`

Android preview and release packaging copies everything in this folder into the
generated `res/raw` bundle directory during `preBuild`.
