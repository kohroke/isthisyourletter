const PEOPLE = window.PEOPLE;
const NAMES = Object.keys(PEOPLE);


const body = document.getElementById("horseBody");
const mane = document.getElementById("horseMane");
const pattern = document.getElementById("horsePattern");
const acc = document.getElementById("horseAcc");
const bgImage = document.getElementById("bgImage");

const rerollBtn = document.getElementById("rerollBtn");

const HORSE_BASES = [
  "./img/horse_base_1.svg",
  "./img/horse_base_2.svg",
  "./img/horse_base_3.svg",
  "./img/horse_base_4.svg",
  "./img/horse_base_5.svg",
];

const PATTERNS = [
  "./img/pattern_1.svg",
  "./img/pattern_2.svg",
  "./img/pattern_3.svg",
  "./img/pattern_4.svg",
  "./img/pattern_5.svg",
];

const ACCS = [
  "./img/acc_1.svg",
  "./img/acc_2.svg",
  "./img/acc_3.svg",
];

function pick(arr){
  return arr[Math.floor(Math.random() * arr.length)];
}

// 배경 틴트(원하면 끄기: applyHorseLook에서 tintBg() 호출 제거)
function tintBg(){
  if (!bgImage) return;
  const hue = Math.floor(Math.random() * 360);
  bgImage.style.filter = `hue-rotate(${hue}deg) saturate(120%)`;
}

// 무늬 색 완전 랜덤(형광 OK)
function randomNeonFilter(){
  const hue = Math.floor(Math.random() * 360);
  const sat = 150 + Math.floor(Math.random() * 250); // 150~400%
  const con = 80 + Math.floor(Math.random() * 100);  // 80~180%
  const bri = 80 + Math.floor(Math.random() * 100);  // 80~180%
  return `hue-rotate(${hue}deg) saturate(${sat}%) contrast(${con}%) brightness(${bri}%)`;
}

// 갈기 컬러 랜덤
function randomManeFilter(){
  const hue = Math.floor(Math.random() * 360);
  const sat = 110 + Math.floor(Math.random() * 80); // 110~190%
  const bri = 90 + Math.floor(Math.random() * 30);  // 90~120%
  return `hue-rotate(${hue}deg) saturate(${sat}%) brightness(${bri}%)`;
}

function applyHorseLook(){
  // 배경 틴트(원치 않으면 이 줄 삭제)
  tintBg();

  // 몸통(이미지 랜덤)
  body.src = pick(HORSE_BASES);

  // 갈기(필터 랜덤)
  mane.style.filter = randomManeFilter();

  // 무늬(파일 랜덤 + 필터 랜덤)
  pattern.src = pick(PATTERNS);
  pattern.style.display = "block";
  pattern.style.filter = randomNeonFilter();

  // 액세서리(파일 랜덤, 컬러 고정)
  acc.src = pick(ACCS);
  acc.style.display = "block";
  acc.style.filter = "none";
}

// 초기 1회
applyHorseLook();


let animating = false;

function playHorseShuffle() {
  if (animating) return;
  animating = true;

  rerollBtn.disabled = true;

  const delays = [40, 55, 70, 90, 120, 160, 210, 270];
  let i = 0;

  // ✅ 마지막에 보이는 컬러(필터/색 상태)를 저장해서 확정 동안 고정
  let lockedBodyFilter = null;
  let lockedPatternFilter = null; // 무늬까지 컬러 바뀌면 같이 고정

  const tick = () => {
    applyHorseLook(); // 여기서 랜덤 컬러/필터가 바뀌는 건 OK (셔플 중이니까)

    // ✅ 현재 상태를 “이번 틱의 결과”로 저장
    lockedBodyFilter = body.style.filter || "";
    lockedPatternFilter = pattern.style.filter || "";

    if (i < delays.length - 1) {
      i++;
      setTimeout(tick, delays[i]);
      return;
    }

    // ===== 여기부터 “확정” 단계 =====
    // ✅ 확정 단계에서 컬러가 바뀌지 않도록, 방금 저장한 값으로 다시 박아줌
    body.style.filter = lockedBodyFilter;
    pattern.style.filter = lockedPatternFilter;

    // ✅ 확정 뿅(여기서 applyHorseLook 다시 호출하면 컬러 또 바뀜 -> 절대 호출 X)
    bgImage.classList.remove("pop");
    void bgImage.offsetWidth;
    bgImage.classList.add("pop");

    acc.classList.remove("pop");
    void acc.offsetWidth;
    acc.classList.add("pop");


    setTimeout(() => {
      bgImage.classList.remove("pop");
      animating = false;
      rerollBtn.disabled = false;
    }, 320);

     setTimeout(() => {
      acc.classList.remove("pop");
      animating = false;
      rerollBtn.disabled = false;
    }, 320);
  };


  tick();


}


rerollBtn.addEventListener("click", playHorseShuffle);



// ✅ URL에서 name 가져오기
function getNameFromURL(){
  const params = new URLSearchParams(location.search);
  return (params.get("name") || "").trim();
}

// ✅ 사람별 편지 데이터

// ✅ 기본 문구(키가 없을 때)
const DEFAULT_LETTER = [
  "저는 2026년에는 즐거운 일이 아주 많이 일어났으면 좋겠어요.", "이걸 보는 당신도 그런 한 해가 되길!",
  "새해에도 잘 부탁드립니다." 
];

function applyLetter(){
  const name = getNameFromURL();

  // To. 라인 적용
  const toNameEl = document.getElementById("toName");
  if (toNameEl) toNameEl.textContent = name || "당신";

  // 본문 적용
  const bodyEl = document.getElementById("bodyText");
  if (!bodyEl) return;

 const lines = PEOPLE[name]?.letter || DEFAULT_LETTER;


  // 줄바꿈 유지해서 넣기
  bodyEl.innerHTML = lines.map(line => `<p class="bodyLine">${line}</p>`).join("");
}




function fitBodyText() {
  const body = document.getElementById("bodyText");
  if (!body) return;

  const maxHeight = body.clientHeight;
  if (!maxHeight) return; // height가 0이면 측정 불가라 종료

  // 시작 폰트사이즈(=CSS 기본값)로 리셋해두면 재렌더링에도 안전
  body.style.fontSize = "16px";

  let fontSize = 16;
  const MIN_FONT = 13;

  while (body.scrollHeight > maxHeight && fontSize > MIN_FONT) {
    fontSize -= 0.2;
    body.style.fontSize = `${fontSize}px`;
  }
}

function renderBodyLines(lines) {
  const body = document.getElementById("bodyText");
  if (!body) return;

  body.innerHTML = "";

  (lines || []).forEach((line) => {
    const p = document.createElement("p");
    p.className = "bodyLine";
    p.textContent = line;
    body.appendChild(p);
  });

  // ✅ DOM에 그려진 다음 프레임에서 줄이기 실행 (에러 방지 핵심)
  requestAnimationFrame(fitBodyText);
}
function applyLetter(){
  const name = getNameFromURL();

  // To. 라인 적용
  const toNameEl = document.getElementById("toName");
  if (toNameEl) toNameEl.textContent = name || "친구";

  // 본문 라인(people.js)
  const lines = PEOPLE?.[name]?.letter || DEFAULT_LETTER;

  // ✅ 여기서 렌더 + (필요하면) 폰트 자동줄이기까지
  renderBodyLines(lines);
}

applyLetter();
