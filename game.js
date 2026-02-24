const socket = io();

// عرض كروت اللاعب
socket.on("yourCards", (cards) => {
  const container = document.getElementById("myCards");
  container.innerHTML = "";

  cards.forEach((card, i) => {
    let cardDiv = document.createElement("div");
    cardDiv.classList.add("card");
    cardDiv.innerText = card.value + " " + card.suit;

    cardDiv.onclick = () => playCard(card, cardDiv);

    container.appendChild(cardDiv);
  });
});

function playCard(card, cardDiv) {
  // مكان البداية (أسفل الشاشة)
  cardDiv.style.position = "absolute";
  const rect = cardDiv.getBoundingClientRect();
  cardDiv.style.left = rect.left + "px";
  cardDiv.style.top = rect.top + "px";
  document.body.appendChild(cardDiv);

  // المكان النهائي (وسط السجادة)
  const trickArea = document.getElementById("trickArea");
  const targetRect = trickArea.getBoundingClientRect();

  // تحريك سلس
  setTimeout(() => {
    cardDiv.style.left = targetRect.left + "px";
    cardDiv.style.top = targetRect.top + "px";
    cardDiv.classList.add("played");
    playSound("place.mp3"); // صوت عند وضع الكرت
  }, 50);

  // إرسال الكرت للسيرفر
  socket.emit("playCard", { card });

  // إزالة الكرت بعد 1 ثانية
  setTimeout(() => cardDiv.remove(), 1000);
}

// تحديث الكروت في اللمة
socket.on("updateTrick", (trickCards) => {
  const area = document.getElementById("trickArea");
  area.innerHTML = "";

  trickCards.forEach((c, i) => {
    let cardDiv = document.createElement("div");
    cardDiv.classList.add("card", "played");
    cardDiv.style.position = "absolute";
    cardDiv.style.left = `${i*60}px`;
    cardDiv.innerText = c.card.value + " " + c.card.suit;
    area.appendChild(cardDiv);
  });
});

// إعلان البلوت
socket.on("blotDeclared", (playerName, scores) => {
  const blotDiv = document.getElementById("blotAnnouncement");
  blotDiv.innerText = `${playerName} أعلن بلوت!`;
  blotDiv.style.display = "block";

  setTimeout(() => {
    blotDiv.style.display = "none";
  }, 2000);

  // تحديث لوحة النقاط
  document.getElementById("scoreBoard").innerText = `الفريق 1: ${scores[0]} | الفريق 2: ${scores[1]}`;
});

// تحديث لوحة النقاط بعد كل لمة
socket.on("trickWinner", (winner, scores) => {
  document.getElementById("scoreBoard").innerText = `الفريق 1: ${scores[0]} | الفريق 2: ${scores[1]}`;
  playSound("score.mp3");
});

// مؤثرات صوتية
function playSound(file) {
  const audio = new Audio(`sounds/${file}`);
  audio.play();
}

// أزرار المزايدة
function choose(type) {
  socket.emit("bid", type);
}
