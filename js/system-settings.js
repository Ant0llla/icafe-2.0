function AudioSettings() 
{
	this.isDragging = false
	this.currentVolume = 50
	this.sliderContainer = null
	this.sliderTrack = null
	this.sliderHandle = null
	this.sliderProgress = null
	this.volumeValue = null
	this.isLoaded = false
	this.volumeTimeout = null

	this.setup = () => {
		if (this.isLoaded) 
			return;

		this.sliderContainer = document.querySelector(".volume-slider-container")
		this.sliderTrack = document.querySelector(".volume-slider-track")
		this.sliderHandle = document.querySelector(".volume-slider-handle")
		this.sliderProgress = document.querySelector(".volume-slider-progress")
		this.volumeValue = document.querySelector(".current-volume")

		this.sliderHandle.addEventListener("mousedown", (e) => {
			this.isDragging = true
			e.preventDefault()
		})

		document.addEventListener("mousemove", (e) => {
			if (!this.isDragging) return
			this.clientXChange(e.clientX)
		})

		document.addEventListener("mouseup", () => {
			this.isDragging = false
		})

		this.sliderTrack.addEventListener("click", (e) => {
			this.clientXChange(e.clientX)
		})

		this.isLoaded = true
	}

	this.clientXChange = (x) => {
		const rect = this.sliderTrack.getBoundingClientRect()
		let newVolume = Math.round(((x - rect.left) / rect.width) * 100)

		newVolume = Math.max(0, Math.min(100, newVolume))

		this.sliderHandle.style.left = `${newVolume}%`
		this.sliderProgress.style.width = `${newVolume}%`
		this.volumeValue.textContent = newVolume

		if (newVolume !== this.currentVolume) {
			this.currentVolume = newVolume
			this.handleVolumeChange(this.currentVolume)
		}
	}

	this.setVolume = (volume) => {
		this.currentVolume = volume
		this.sliderHandle.style.left = `${volume}%`
		this.sliderProgress.style.width = `${volume}%`
		this.volumeValue.textContent = volume
	}

	this.handleVolumeChange = (volume) => {
		if (this.volumeTimeout) {
			clearTimeout(this.volumeTimeout)
		}
		this.volumeTimeout = setTimeout(() => {
			CallFunction("VOLUME " + volume)
			this.volumeTimeout = null
		}, 500)
	}
}


function MouseSettings() {
	this.isDoubleClickDragging = false
	this.isMoveSpeedDragging = false

	// double click speed
	this.currentDoubleClickSpeed = 5
	this.doubleClickSpeedValue = null
	this.doubleClickSliderTrack = null
	this.doubleClickSliderHandle = null
	this.doubleClickSliderProgress = null
	this.doubleClickTimeout = null

	// move speed
	this.currentMoveSpeed = 5
	this.moveSpeedValue = null
	this.moveSpeedSliderTrack = null
	this.moveSpeedSliderHandle = null
	this.moveSpeedSliderProgress = null
	this.moveSpeedTimeout = null

	// mouse smoothness
	this.mouseSmoothnessSwitch = null
	this.smoothnessTimeout = null

	this.isLoaded = false

	this.setup = () => {
		if (this.isLoaded) return

		this.doubleClickSliderTrack = document.querySelector(".double-click-slider-track")
		this.doubleClickSliderHandle = document.querySelector(".double-click-slider-handle")
		this.doubleClickSliderProgress = document.querySelector(".double-click-slider-progress")
		this.doubleClickSpeedValue = document.querySelector(".double-click-current-speed")

		this.moveSpeedSliderTrack = document.querySelector(".mouse-move-slider-track")
		this.moveSpeedSliderHandle = document.querySelector(".mouse-move-slider-handle")
		this.moveSpeedSliderProgress = document.querySelector(".mouse-move-slider-progress")
		this.moveSpeedValue = document.querySelector(".mouse-move-current-speed")

		this.mouseSmoothnessSwitch = document.querySelector(".mouse-smoothness-control")

		this.doubleClickSliderHandle.addEventListener("mousedown", (e) => {
			this.isDoubleClickDragging = true
			e.preventDefault()
		})

		this.doubleClickSliderTrack.addEventListener("click", (e) => {
			this.doubleClickXChange(e.clientX)
		})

		this.moveSpeedSliderHandle.addEventListener("mousedown", (e) => {
			this.isMoveSpeedDragging = true
			e.preventDefault()
		})

		this.moveSpeedSliderTrack.addEventListener("click", (e) => {
			this.moveSpeedXChange(e.clientX)
		})

		document.addEventListener("mousemove", (e) => {
			if (this.isDoubleClickDragging) this.doubleClickXChange(e.clientX)
			if (this.isMoveSpeedDragging) this.moveSpeedXChange(e.clientX)
		})

		document.addEventListener("mouseup", () => {
			this.isDoubleClickDragging = false
			this.isMoveSpeedDragging = false
		})

		this.mouseSmoothnessSwitch.addEventListener("change", (e) => {
			this.handleMouseSmoothnessChange(e.target.checked)
		})

		this.isLoaded = true
	}

	this.doubleClickXChange = (x) => {
		const rect = this.doubleClickSliderTrack.getBoundingClientRect()
		let newDoubleClickSpeed = Math.round(((x - rect.left) / rect.width) * 10)

		newDoubleClickSpeed = Math.max(0, Math.min(10, newDoubleClickSpeed))

		this.doubleClickSliderHandle.style.left = `${newDoubleClickSpeed * 10}%`
		this.doubleClickSliderProgress.style.width = `${newDoubleClickSpeed * 10}%`
		this.doubleClickSpeedValue.textContent = newDoubleClickSpeed

		if (newDoubleClickSpeed !== this.currentDoubleClickSpeed) {
			this.currentDoubleClickSpeed = newDoubleClickSpeed
			this.handleDoubleClickSpeedChange(this.currentDoubleClickSpeed)
		}
	}

	this.setDoubleClickSpeed = (doubleClickSpeed) => {
		this.currentDoubleClickSpeed = doubleClickSpeed
		this.doubleClickSliderHandle.style.left = `${doubleClickSpeed * 10}%`
		this.doubleClickSliderProgress.style.width = `${doubleClickSpeed * 10}%`
		this.doubleClickSpeedValue.textContent = doubleClickSpeed
	}

	this.handleDoubleClickSpeedChange = (doubleClickSpeed) => {
		if (this.doubleClickTimeout) {
			clearTimeout(this.doubleClickTimeout)
		}
		this.doubleClickTimeout = setTimeout(() => {
			CallFunction("MOUSE_DOUBLE_CLICK_SPEED " + doubleClickSpeed)
			this.doubleClickTimeout = null
		}, 500)
	}

	this.moveSpeedXChange = (x) => {
		const rect = this.moveSpeedSliderTrack.getBoundingClientRect()
		let newMoveSpeed = Math.round(((x - rect.left) / rect.width) * 10)

		newMoveSpeed = Math.max(0, Math.min(10, newMoveSpeed))

		this.moveSpeedSliderHandle.style.left = `${newMoveSpeed * 10}%`
		this.moveSpeedSliderProgress.style.width = `${newMoveSpeed * 10}%`
		this.moveSpeedValue.textContent = newMoveSpeed

		if (newMoveSpeed !== this.currentMoveSpeed) {
			this.currentMoveSpeed = newMoveSpeed
			this.handleMoveSpeedChange(this.currentMoveSpeed)
		}
	}

	this.setMoveSpeed = (moveSpeed) => {
		this.currentMoveSpeed = moveSpeed
		this.moveSpeedSliderHandle.style.left = `${moveSpeed * 10}%`
		this.moveSpeedSliderProgress.style.width = `${moveSpeed * 10}%`
		this.moveSpeedValue.textContent = moveSpeed
	}

	this.handleMoveSpeedChange = (moveSpeed) => {
		if (this.moveSpeedTimeout) {
			clearTimeout(this.moveSpeedTimeout)
		}
		this.moveSpeedTimeout = setTimeout(() => {
			CallFunction("MOUSE_MOVE_SPEED " + moveSpeed)
			this.moveSpeedTimeout = null
		}, 500)
	}

	this.setMouseSmoothness = (checked) => {
		const input = document.getElementById("mouseSmoothnessSwitch")
		if (input) {
			input.checked = checked
		}

		const label = document.querySelector('label[for="mouseSmoothnessSwitch"]')
		if (label) {
			label.classList.toggle('active', checked)
		}
	}

	this.handleMouseSmoothnessChange = (checked) => {
		if (this.smoothnessTimeout) {
			clearTimeout(this.smoothnessTimeout)
		}
		this.smoothnessTimeout = setTimeout(() => {
			CallFunction("MOUSE_SMOOTHNESS " + (checked ? "1" : "0"))
			this.smoothnessTimeout = null
		}, 500)
	}
}
