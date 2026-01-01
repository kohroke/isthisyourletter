// ✅ people.js에서 데이터 가져오기
const PEOPLE = window.PEOPLE || {};
const names = Object.keys(PEOPLE);

// ✅ 이름 → 비번 매핑 자동 생성
const NAME_PASSWORD_MAP = Object.fromEntries(
  names.map((n) => [n, String(PEOPLE[n]?.pw ?? "")])
);

const horse = document.getElementById("horse");
const shuffleBtn = document.getElementById("shuffle");

// ✅ 이름 라벨 3개 (HTML에 id 있어야 함)
const nameLabels = [
  document.getElementById("nameLabel1"),
  document.getElementById("nameLabel2"),
  document.getElementById("nameLabel3"),
];


// 방어: 요소 없으면 여기서 멈추고 콘솔에 찍기
if (!horse || !shuffleBtn || nameLabels.some(el => !el)) {
  console.error("필수 요소 누락", { horse, shuffleBtn, nameLabels });
}

const FRAME_W = 1080;
const STOP_FRAME = 0; // 0번에서 멈춤(내민 컷)
const MAX_FRAME = 6;  // 0~6

let animating = false;
let currentFrame = STOP_FRAME;

function setFrame(n) {
  horse.style.backgroundPositionX = `${-FRAME_W * n}px`;
  currentFrame = n;

  // ✅ 0번 프레임에서만 이름 보이기
  const visible = (n === STOP_FRAME) ? "1" : "0";
  nameLabels.forEach(el => el.style.opacity = visible);
}

function makePingPongSequence() {
  // 1,2,3,4,5,6,5,4,3,2,1
  const forward = [];
  for (let i = 1; i <= MAX_FRAME; i++) forward.push(i);
  const backward = [];
  for (let i = MAX_FRAME - 1; i >= 1; i--) backward.push(i);
  return forward.concat(backward);
}

// ✅ 중복 없이 3명 뽑기
function pickThreeUnique() {
  // names 길이가 3 이상이라는 전제
  const pool = [...names];
  // 간단 셔플
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, 3);
}

function playShuffle() {
  if (animating) return;
  animating = true;

  const seq = makePingPongSequence();
  let idx = 0;

  const interval = setInterval(() => {
    setFrame(seq[idx]);
    idx++;

    if (idx >= seq.length) {
      clearInterval(interval);
      setTimeout(() => {
        setFrame(STOP_FRAME);
        animating = false;
      }, 150);
    }
  }, 120);
}

shuffleBtn.addEventListener("click", () => {
  // 버튼 누를 때마다 3명 갱신
  const [a, b, c] = pickThreeUnique();
  nameLabels[0].textContent = a;
  nameLabels[1].textContent = b;
  nameLabels[2].textContent = c;

  playShuffle();
});

// 초기: 0번 프레임 + 기본 이름 3개 세팅
{
  const [a, b, c] = pickThreeUnique();
  nameLabels[0].textContent = a;
  nameLabels[1].textContent = b;
  nameLabels[2].textContent = c;
  setFrame(STOP_FRAME);
}


// ====== 비번 확인 모달 ======
const confirmModal = document.getElementById("confirmModal");
const pickedNameEl = document.getElementById("pickedName");
const pwInput = document.getElementById("pwInput");
const pwError = document.getElementById("pwError");
const confirmCancel = document.getElementById("modalCancel");
const confirmOk = document.getElementById("modalOk");
const confirmBackdrop = confirmModal?.querySelector(".modal__backdrop");

let pendingName = "";

function openConfirmModal(name){
  pendingName = name;
  if (pickedNameEl) pickedNameEl.textContent = name;

  if (pwInput) pwInput.value = "";
  if (pwError) pwError.textContent = "";

  confirmModal?.classList.add("is-open");
  confirmModal?.setAttribute("aria-hidden", "false");
  pwInput?.focus();
}

function closeConfirmModal(){
  confirmModal?.classList.remove("is-open");
  confirmModal?.setAttribute("aria-hidden", "true");
  pendingName = "";
}

function submitConfirmModal(){
  if (!pendingName) {
    if (pwError) pwError.textContent = "이름이 선택되지 않았어요.";
    return;
  }

  const correctPw = NAME_PASSWORD_MAP[pendingName];
  if (!correctPw){
    if (pwError) pwError.textContent = "등록되지 않은 이름이에요.";
    return;
  }

  const inputPw = (pwInput?.value || "").trim();
  if (inputPw !== correctPw){
    if (pwError) pwError.textContent = "비밀번호가 맞지 않아요.";
    pwInput?.focus();
    pwInput?.select();
    return;
  }

  location.href = `letter.html?name=${encodeURIComponent(pendingName)}`;
}

// 네임태그 클릭 → 모달 열기
nameLabels.forEach((el) => {
  el?.addEventListener("click", () => {
    const name = (el.textContent || "").trim();
    if (!name) return;
    openConfirmModal(name);
  });
});

// 취소 / 배경 클릭 닫기
confirmCancel?.addEventListener("click", closeConfirmModal);
confirmBackdrop?.addEventListener("click", closeConfirmModal);

// 확인
confirmOk?.addEventListener("click", submitConfirmModal);

// 엔터로 확인, ESC로 닫기
pwInput?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") submitConfirmModal();
  if (e.key === "Escape") closeConfirmModal();
});


// ====== 주인없는 편지 모달 ======
const orphanBtn = document.getElementById("orphanLetterBtn");

const orphanModal = document.getElementById("orphanModal");
const orphanInput = document.getElementById("orphanNameInput");
const orphanError = document.getElementById("orphanError");
const orphanCancel = document.getElementById("orphanCancel");
const orphanGo = document.getElementById("orphanGo");
const orphanBackdrop = orphanModal?.querySelector(".modal__backdrop");

function openOrphanModal(){
  orphanModal?.classList.add("is-open");
  document.body.classList.add("modal-open");
  if (orphanError) orphanError.textContent = "";
  if (orphanInput) orphanInput.value = "";
  setTimeout(() => orphanInput?.focus(), 0);
}

function closeOrphanModal(){
  orphanModal?.classList.remove("is-open");
  document.body.classList.remove("modal-open");
}

function submitOrphanName(){
  const name = (orphanInput?.value || "").trim();
  if (!name){
    if (orphanError) orphanError.textContent = "이름을 입력해줘요!";
    orphanInput?.focus();
    return;
  }
  location.href = `letter.html?name=${encodeURIComponent(name)}&mode=orphan`;
}

orphanBtn?.addEventListener("click", openOrphanModal);
orphanCancel?.addEventListener("click", closeOrphanModal);
orphanBackdrop?.addEventListener("click", closeOrphanModal);
orphanGo?.addEventListener("click", submitOrphanName);

orphanInput?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") submitOrphanName();
  if (e.key === "Escape") closeOrphanModal();
});
