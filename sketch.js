let video;
let handpose;
let predictions = []; // 用於儲存手勢預測

let fallingObjects = [];
let currentQuestion;
let score = 0;
let paddleX; // 長方形的 X 座標

function setup() {
  createCanvas(windowWidth, windowHeight); // 設定畫布大小為視窗大小
  video = createCapture(VIDEO);
  video.size(160, 120); // 設定視訊大小為 160x120
  video.hide(); // 隱藏 HTML 視訊元素

  handpose = ml5.handpose(video, () => {
    console.log("Handpose model loaded");
  }); // 初始化手勢識別模型

  handpose.on("predict", (results) => {
    predictions = results; // 更新預測結果
  });

  paddleX = width / 2; // 初始化長方形的位置
  generateQuestion(); // 生成初始題目
}

function draw() {
  background("#FFEEDD"); // 遊戲畫布背景色

  // 翻轉視訊畫面並顯示在左上角
  push();
  translate(160, 0); // 移動到視訊畫面的右邊界
  scale(-1, 1); // 水平翻轉視訊
  image(video, 0, 0, 160, 120); // 顯示翻轉後的視訊畫面
  pop();

  drawHand();
  drawFallingObjects();
  displayQuestion();
  drawPaddle();

  // 顯示分數在右上角，往左移
  fill("#003060"); // 使用深藍色文字
  textSize(28); // 設定字型大小為 28px
  textAlign(RIGHT, TOP); // 將文字對齊方式設為右上角
  text("Score: " + score, width - 40, 20); // 分數顯示在右上角，距離右邊 40 像素
}

function drawHand() {
  if (predictions.length > 0) {
    const hand = predictions[0]; // 偵測到的第一隻手

    // 翻轉手掌中心的座標到畫布範圍
    const handX = map(video.width - hand.landmarks[9][0], 0, video.width, 0, width); // 翻轉 X 座標並映射到畫布範圍
    const handY = map(hand.landmarks[9][1], 0, video.height, 0, height); // 映射 Y 座標到畫布範圍

    // 更新長方形的位置
    paddleX = constrain(handX, 0, width - 100); // 限制長方形在畫布範圍內

    // 繪製手部關鍵點
    for (let point of hand.landmarks) {
      const flippedX = map(video.width - point[0], 0, video.width, 0, width); // 翻轉每個關鍵點的 X 座標並映射到畫布範圍
      const mappedY = map(point[1], 0, video.height, 0, height); // 映射每個關鍵點的 Y 座標到畫布範圍
      fill(0, 255, 0);
      noStroke();
      ellipse(flippedX, mappedY, 10, 10); // 畫綠色圓點
    }
  }
}

function drawFallingObjects() {
  for (let obj of fallingObjects) {
    fill(255); // 統一使用白色圓形
    ellipse(obj.x, obj.y, 60, 60); // 繪製球，將直徑調整為原本的兩倍
    fill(0); // 使用黑色文字
    textSize(16);
    textAlign(CENTER, CENTER);
    text(obj.value, obj.x, obj.y); // 在球上顯示數字
    obj.y += obj.speed; // 物件下落

    // 檢查是否碰到長方形
    if (obj.y > height - 20 && obj.x > paddleX && obj.x < paddleX + 100) {
      if (obj.isCorrect) {
        score += 10; // 加分
        generateQuestion(); // 生成新題目
      } else {
        score -= 5; // 扣分
      }
      fallingObjects.splice(fallingObjects.indexOf(obj), 1); // 移除物件
    }

    // 移除超出畫布的物件
    if (obj.y > height) {
      fallingObjects.splice(fallingObjects.indexOf(obj), 1);
    }
  }

  // 如果沒有物件，繼續生成
  if (fallingObjects.length === 0) {
    generateQuestion();
  }
}

function drawPaddle() {
  fill(255);
  rect(paddleX, height - 20, 100, 10); // 在底部繪製長方形
}

function displayQuestion() {
  fill("#003060");
  textSize(48); // 設定字型大小為 48px
  stroke("003060"); // 設定描邊顏色
  strokeWeight(2); // 設定描邊粗細
  textAlign(CENTER, CENTER); // 將文字置中
  text(currentQuestion.question, width / 2, 50); // 顯示題目在畫布的中間上方
}

function generateQuestion() {
  const num1 = floor(random(1, 10));
  const num2 = floor(random(1, 10));
  const correctAnswer = num1 + num2;

  currentQuestion = {
    question: `What is ${num1} + ${num2}?`,
    correctAnswer: correctAnswer,
  };

  fallingObjects = []; // 清空掉落物件

  // 生成正確答案
  fallingObjects.push({
    x: random(160, width - 30),
    y: 0,
    speed: random(2, 5),
    value: correctAnswer,
    isCorrect: true,
  });

  // 生成錯誤答案
  for (let i = 0; i < 2; i++) {
    let wrongAnswer;
    do {
      wrongAnswer = floor(random(1, 20)); // 確保錯誤答案不等於正確答案
    } while (wrongAnswer === correctAnswer);

    fallingObjects.push({
      x: random(160, width - 30),
      y: 0,
      speed: random(2, 5),
      value: wrongAnswer,
      isCorrect: false,
    });
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight); // 當視窗大小改變時，重新調整畫布大小
}
