
<template>
  <div id="app">
    <p class="text-white" v-if="loading">Loading...</p>
    <button class="bg-white" @click="getVoices">Get Voices</button>
    <button class="bg-white" @click="postVoice">Post Voice</button>

    <audio ref="audioPlayer" autoplay controls>
      <source :src="audioSrc" download="audio.mp3" type="audio/mpeg">
    </audio>

    <img src="./assets/glados.png" alt="" :class="animation ? 'animate' : 'static'" />

    <input type="text" v-model="message" @keyup.enter="talkToGLaDOS(message)"
      placeholder="Talk to GLaDOS in this area..." />
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'App',
  data() {
    return {
      message: '',
      response: '',
      loading: false,
      audioSrc: '',
      animation: false,
    }
  },

  methods: {
    async talkToGLaDOS(message) {
      const gladosMessage = await this.chatWithGPT(message)
      console.log(gladosMessage)
      this.postVoice(gladosMessage)
    },

    animerGLaDOS() {
      this.animation = true
      setTimeout(() => {
        this.animation = false
      }, 10000)
    },

    async chatWithGPT(message) {
      try {
        this.loading = true

        const response = await axios.post('http://localhost:3000/gpt', {
          message: message
        });

        console.log(response.data.data.content)
        this.response = response.data.data.content
        this.loading = false
        return response.data.data.content

      } catch (error) {
        console.log(error)
      }
    },

    async getVoices() {
      try {
        await axios.get('http://localhost:3000/elevenlabs').then(response => {
          console.log(response.data)
        })
      } catch (error) {
        console.log(error)
      }
    },

    async postVoice(message) {
      try {
        this.loading = true
        await axios.post('http://localhost:3000/elevenlabs', {
          message: message,
        }).then(response => {
          this.loading = false
          this.audioSrc = response.data.data.filePath
          console.log(this.audioSrc)
          this.animerGLaDOS()
          this.$nextTick(() => {
            this.$refs.audioPlayer.load();
            this.$refs.audioPlayer.play();
          });
          console.log(response.data)
          this.message = ''
        })
      } catch (error) {
        this.loading = false
        console.log(error)
      }
    }
  },
}
</script>

<style lang="scss" scoped>
#app {
  height: 100vh;
  width: 100vw;

  background-image: url("https://i.ytimg.com/vi/MWP_fgvKcaU/maxresdefault.jpg");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;

  position: relative;

  input {
    padding: 10px;
    width: 50vw;
    height: 50px;
    position: absolute;
    bottom: 10px;
    left: calc(50% - 25vw);

    color: white;

    background-color: rgba($color: #000000, $alpha: 0.7);
    backdrop-filter: blur(4px);
  }

  img {
    position: absolute;
    top: -20px;
    left: calc(50% - 300px);
    width: 700px;
  }

  audio {
    width: 0;
    overflow: hidden;
  }
}

.animate {
  transform-origin: top center;
  animation: swing 15s ease infinite;
}

@keyframes swing {
  0% {
    transform: rotate(-10deg);
  }
  8% {
    transform: rotate(13deg);
  }
  16% {
    transform: rotate(-14deg);
  }
  24% {
    transform: rotate(13deg);
  }
  33% {
    transform: rotate(-11deg);
  }
  37% {
    transform: rotate(10deg);
  }
  44% {
    transform: rotate(-9deg);
  }
  52% {
    transform: rotate(8deg);
  }
  61% {
    transform: rotate(-15deg);
  }
  66% {
    transform: rotate(12deg);
  }
  70% {
    transform: rotate(-10deg);
  }
  76% {
    transform: rotate(15deg);
  }
  81% {
    transform: rotate(-7deg);
  }
  88% {
    transform: rotate(6deg);
  }
  90% {
    transform: rotate(-10deg);
  }
  92% {
    transform: rotate(14deg);
  }
  96% {
    transform: rotate(-8deg);
  }
  98% {
    transform: rotate(7deg);
  }
  100% {
    transform: rotate(-5deg);
  }
}



.static {
  transform-origin: top center;
  animation: swing2 20s ease infinite;
}

@keyframes swing2 {
  0% {
    transform: rotate(-10deg);
  }
  10% {
    transform: rotate(9deg);
  }
  20% {
    transform: rotate(-8deg);
  }
  30% {
    transform: rotate(7deg);
  }
  40% {
    transform: rotate(-6deg);
  }
  50% {
    transform: rotate(5deg);
  }
  60% {
    transform: rotate(-4deg);
  }
  70% {
    transform: rotate(3deg);
  }
  80% {
    transform: rotate(-2deg);
  }
  90% {
    transform: rotate(1deg);
  }
  100% {
    transform: rotate(0deg);
  }
}


</style>
