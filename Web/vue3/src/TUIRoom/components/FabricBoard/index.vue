<template>
  <div class="fabric-board-container">
    <canvas id="fabricBoard" width="1920" height="1080"></canvas>
    <div id="boardTool" class="board-tools">
      <button @click="handleAddImg">add img</button>
      <button @click="handleAddText">add Text</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { fabric } from 'fabric';

let canvas: any = null;
let lastTimerText: any = null;

function handleAddImg() {
  new fabric.Image.fromURL('https://web.sdk.qcloud.com/trtc/webrtc/test/xinli-test/avatar8_100.20191230.png', image => {
    image.scale(0.75);
    canvas.add(image);
    canvas.renderAll();
  }, { crossOrigin: 'anonymous' });
}

function handleAddText() {
  const text = new fabric.Text('This is a text input', {
    top: 50,
    left: 150,
    textAlign: 'center',
    charSpacing: -50,
    pathSide: 'left',
    pathStartOffset: 0,
  });

  canvas?.add(text);
}

function drawText(text: string) {
  if (lastTimerText) {
    canvas?.remove(lastTimerText);
  }
  lastTimerText = new fabric.Text(text, {
    top: 150,
    left: 150,
    textAlign: 'center',
    charSpacing: -50,
    pathSide: 'left',
    pathStartOffset: 0,
    fill: 'transparent',
  });

  canvas?.add(lastTimerText);
}

function handleCanvasText() {
  setInterval(() => {
    drawText(String(Date.now()));
  }, 1500);
}

function handleCanvasRect() {
  const rect = new fabric.Rect({
    top: 100,
    left: 100,
    width: 60,
    height: 70,
    fill: 'red',
  });
  canvas.add(rect);
}

onMounted(() => {
  canvas = new fabric.Canvas('fabricBoard');
  canvas.backgroundColor = '#EEEEEE';

  handleCanvasRect();
  handleCanvasText();
});
</script>

<style lang="scss">
.fabric-board-container {
  position: absolute;
  top: 0;
  left: 0;
  .board-tools {
    position: absolute;
    bottom: 4px;
    button {
      margin-right: 10px;
      font-size: 24px;
    }
  }
}
</style>
