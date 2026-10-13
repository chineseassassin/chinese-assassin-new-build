  // ── IN-PLACE PLAY / PAUSE LOGIC (SHARED PLAYBACK STATE ACROSS UPPER & BOTTOM PLAY) ──
  async play() {
    if (!this.video) return;

    if (!this.screenUnit) this.screenUnit = document.querySelector('.nf-screen-unit');

    try {
      if (this.screenUnit) {
        this.screenUnit.classList.add('in-playback-mode');
      }
      await this.video.play();
      this.isPlaying = true;
      this.onPlayStateChange(true);
    } catch (err) {
      console.warn('Playback error or user gesture required:', err);
      if (this.screenUnit) {
        this.screenUnit.classList.add('in-playback-mode');
      }
      this.isPlaying = true;
    }
  }

  pause() {
    if (this.video && !this.video.paused) {
      this.video.pause();
    }
    this.isPlaying = false;
    if (!this.screenUnit) this.screenUnit = document.querySelector('.nf-screen-unit');
    if (this.screenUnit) {
      this.screenUnit.classList.remove('in-playback-mode');
    }
    this.onPlayStateChange(false);
  }

  togglePlayPause() {
    if (this.video && !this.video.paused) {
      this.pause();
    } else {
      this.play();
    }
  }