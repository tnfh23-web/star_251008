setTimeout(function () {
  $(".loading").fadeOut(); // 로딩창 서서히 사라짐
}, 1500);

// 사이드바 시작
$(".sidebar_menu-box").click(function () {
  $(".slide-menu").addClass("active");

  // 사이드바 열릴 때 기본값 스타스케이프 세팅
  let firstMenu = $(".menu-links li a").first();
  let imgSrc = firstMenu.data("img");
  let boxType = firstMenu.data("box");

  $(".side-img-box img").attr("src", imgSrc);
  $(".right-box").html(rightBoxContents[boxType] || "");
  $(".side-img-box, .right-box").addClass("active");
});

$(".close-btn").click(function () {
  $(".slide-menu").removeClass("active");
  $(".side-img-box, .right-box").removeClass("active");
});
// 사이드바 끝

// 오른쪽 상세 내용 정의
const rightBoxContents = {
  brand: `
    <li><a href="@">브랜드 소개</a></li>
    <li><a href="@">아이덴티티</a></li>
  `,
  room: `
    <li><a href="@">디럭스</a></li>
    <li><a href="@">프리미어</a></li>
    <li><a href="@">오션 스위트</a></li>
    <li><a href="@">패밀리 스위트</a></li>
    <li><a href="@">프리미어 스위트</a></li>
    <li><a href="@">로얄 스위트</a></li>
  `,
  facility: `
    <li><a href="@">메인 풀</a></li>
    <li><a href="@">프라이빗 룸</a></li>
    <li><a href="@">카페</a></li>
    <li><a href="@">편의점</a></li>
  `,
  event: `
    <li><a href="@">프로모션</a></li>
    <li><a href="@">이벤트 안내</a></li>
  `,
  location: `
    <li><a href="@">지도 보기</a></li>
    <li><a href="@">교통 안내</a></li>
  `,
};

// 메뉴 hover 시 이미지 + 오른쪽 내용 업데이트
$(".menu-links li a").hover(function () {
  let imgSrc = $(this).data("img");
  let boxType = $(this).data("box");

  $(".side-img-box img").attr("src", imgSrc);
  $(".right-box").html(rightBoxContents[boxType] || "");
  $(".side-img-box, .right-box").addClass("active");
});

// 닫기 버튼
$(".close-btn").click(function () {
  $(".side-img-box, .right-box").removeClass("active");
});

// 1섹션 슬라이드 시작

const slides = document.querySelectorAll(".slide");
const prevBtn = document.querySelector(".swiper-button-prev"); // 3섹션 버튼 가져오기
const nextBtn = document.querySelector(".swiper-button-next"); // 3섹션 버튼 가져오기
const current = document.querySelector(".current");
const total = document.querySelector(".total");
const progress = document.querySelector(".progress");

let now = 0;
let count = slides.length;
let autoNextTimer = null;

// 총 슬라이드 수 표시
total.textContent = String(count).padStart(2, "0");

function showSlide(n) {
  // 1. 모든 슬라이드 비활성화
  slides.forEach((slide) => slide.classList.remove("active"));

  // 2. 현재 슬라이드만 활성화
  slides[n].classList.add("active");

  // 3. 현재 인덱스 표시
  current.textContent = String(n + 1).padStart(2, "0");

  // 4. progress 바 초기화 후 다시 animate 트리거
  progress.classList.remove("animate");
  void progress.offsetWidth; // 리플로우 강제
  progress.classList.add("animate");

  // 5. 자동 넘김 타이머 재설정
  clearTimeout(autoNextTimer);
  autoNextTimer = setTimeout(() => {
    now = (now + 1) % count;
    showSlide(now);
  }, 4000); // 4초마다 자동 이동
}
// 1섹션 끝
// 2섹션 슬라이드 시작
function Box1__init() {
  let $tabList = $(".box-1__head ul");
  let $tabs = $tabList.find("li");
  let $prevBtn = $(".btn-prev");
  let $nextBtn = $(".btn-next");
  let visibleCount = 3;
  let currentIndex = 0;
  let totalTabs = $tabs.length;

  // 탭 클릭
  $tabs.click(function () {
    let $this = $(this);
    let thisIndex = $this.index();

    $tabs.removeClass("active");
    $this.addClass("active");

    $(".box-1__main ul li").hide().removeClass("active").eq(thisIndex).addClass("active").fadeIn(500);
  });

  // 왼쪽 버튼
  $prevBtn.click(function () {
    if (currentIndex > 0) {
      currentIndex--;
      updateSlide();
    }
  });

  // 오른쪽 버튼
  $nextBtn.click(function () {
    if (currentIndex < totalTabs - visibleCount) {
      currentIndex++;
      updateSlide();
    }
  });

  function updateSlide() {
    let tabWidth = $tabs.outerWidth(true);
    $tabList.css("transform", `translateX(${-tabWidth * currentIndex}px)`);
  }
}

// Box1__init();

function sec2_swiper__init() {
  const target = document.querySelector(".section_2 .swiper-container");
  let $tabList = $(".box-1__head ul");
  let $tabs = $tabList.find("li");

  let sec2_swiper = new Swiper(target, {
    slidesPerView: 3,
    loop: true,
    centeredSlides: true,
    navigation: {
      nextEl: ".section_2 .head-btn.btn-next",
      prevEl: ".section_2 .head-btn.btn-prev",
    },
  });
  sec2_findIndex();
}

function sec2_findIndex() {
  const swiperSlide = document.querySelectorAll(".section_2 .swiper-slide");
  let $tabBoxList = $(".box-1__main");
  let $tabsBox = $tabBoxList.find("li");

  let activeIndex;

  let target = $(".section_2 .box-1__head");

  target.click(function () {
    swiperSlide.forEach((el, index) => {
      let hasClass = el.classList.contains("swiper-slide-active");
      if (hasClass) {
        activeIndex = index;
      }
    });

    $tabsBox.removeClass("active");
    $tabsBox.eq(activeIndex).addClass("active");
  });
}
window.addEventListener("load", () => {
  sec2_swiper__init();
});

// 2섹션 끝
// 버튼 클릭 이벤트
prevBtn.addEventListener("click", () => {
  now = (now - 1 + count) % count;
  showSlide(now);
});

nextBtn.addEventListener("click", () => {
  now = (now + 1) % count;
  showSlide(now);
});
//1섹션 슬라이드 끝
// 4섹션 슬라이드 시작
var eventSwiper = new Swiper(".event-swiper", {
  loop: false, //
  pagination: {
    el: ".event-pagination",
    clickable: true,
    type: "fraction",
  },
  navigation: {
    nextEl: ".event-button-next",
    prevEl: ".event-button-prev",
  },
  spaceBetween: 30,

  breakpoints: {
    1024: {
      slidesPerView: 2.5,
      spaceBetween: 30,
    },
    768: {
      slidesPerView: 1.5,
      spaceBetween: 20,
      centeredSlides: true,
    },
    480: {
      slidesPerView: 1,
      spaceBetween: 10,
      centeredSlides: true,
    },
  },
});

//4섹션 슬라이드 끝
// 첫 로딩 시 실행
showSlide(now);
