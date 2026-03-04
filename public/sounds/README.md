# Music Mixer - Sound Files

This directory should contain 8 royalty-free nature sound files.

## Required Files

The following files are required and should be placed in this directory:

1. **rain.mp3** - Light rain ambience (120 seconds recommended)
2. **thunder.mp3** - Distant thunder (90 seconds recommended)
3. **fireplace.mp3** - Crackling fireplace (180 seconds recommended)
4. **birds.mp3** - Forest birds chirping (120 seconds recommended)
5. **wind.mp3** - Gentle wind rustling (150 seconds recommended)
6. **ocean.mp3** - Ocean waves crashing (180 seconds recommended)
7. **forest.mp3** - Forest ambience (120 seconds recommended)
8. **stream.mp3** - Flowing stream water (150 seconds recommended)

## Free Audio Sources

You can download royalty-free nature sounds from:

- **Freesound.org** - https://freesound.org (CC0, attribution required)
- **Pixabay Sound Effects** - https://pixabay.com/sound-effects/ (CC0)
- **Zapsplat** - https://www.zapsplat.com (free, commercial use allowed)
- **BBC Sound Effects** - https://sound-effects.bbcrewind.co.uk/ (CC0)
- **Free Music Archive** - https://freemusicarchive.org

## Setting Up with Node Script

Run the setup script (future) to download placeholder audio files:

```bash
pnpm run setup:sounds
```

## Manual Setup

1. Download 8 MP3 files from the sources above
2. Rename them to match the filenames above
3. Place them in this directory: `public/sounds/`
4. (Optional) Verify file sizes - they should be reasonable MP3 files (100KB - 5MB each)

## Notes

- Files will be lazy-loaded by the audio engine
- Supported format: MP3 (WAV, OGG, FLAC also work in modern browsers)
- Duration specified in `/app/projects/mixer/lib/constants.ts` can be updated if files differ
- For best results, use looping ambient sounds (music that doesn't have a clear ending)

---

**Status:** ⏳ Placeholder files needed - Phase 1 can run without audio, but mixer won't produce sound

