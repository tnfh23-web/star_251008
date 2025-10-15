/* -----------------------------------------------------
   로딩 화면
----------------------------------------------------- */
setTimeout(function () {
  $(".loading").fadeOut(); // 로딩창 서서히 사라짐
}, 1500);

// 헤더 시작

var didScroll;
var lastScrollTop = 0;
var delta = 5;
var navbarHeight = $("header").outerHeight();

$(window).scroll(function (event) {
  didScroll = true;
});

setInterval(function () {
  if (didScroll) {
    hasScrolled();
    didScroll = false;
  }
}, 250);

function hasScrolled() {
  var st = $(this).scrollTop();

  // Make sure they scroll more than delta
  if (Math.abs(lastScrollTop - st) <= delta) return;

  // If they scrolled down and are past the navbar, add class .nav-up.
  // This is necessary so you never see what is "behind" the navbar.
  if (st > lastScrollTop && st > navbarHeight) {
    // Scroll Down
    $("header").removeClass("nav-down").addClass("nav-up");
  } else {
    // Scroll Up
    if (st + $(window).height() < $(document).height()) {
      $("header").removeClass("nav-up").addClass("nav-down");
    }
  }

  lastScrollTop = st;
}

/* -----------------------------------------------------

   사이드바 시작
----------------------------------------------------- */
$(".sidebar_menu-box").click(function () {
  $(".slide-menu").addClass("active");

  // 사이드바 열릴 때 기본값: 스타스케이프 세팅
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

$(".close-btn").click(function () {
  $(".side-img-box, .right-box").removeClass("active");
});

/* -----------------------------------------------------
   섹션 1: Hero 슬라이드
----------------------------------------------------- */
const slides = document.querySelectorAll(".slide");
const prevBtn = document.querySelector(".swiper-button-prev");
const nextBtn = document.querySelector(".swiper-button-next");
const current = document.querySelector(".current");
const total = document.querySelector(".total");
const progress = document.querySelector(".progress");

let now = 0;
let count = slides.length;
let autoNextTimer = null;

total.textContent = String(count).padStart(2, "0");

function showSlide(n) {
  slides.forEach((slide) => slide.classList.remove("active"));
  slides[n].classList.add("active");

  current.textContent = String(n + 1).padStart(2, "0");

  progress.classList.remove("animate");
  void progress.offsetWidth;
  progress.classList.add("animate");

  clearTimeout(autoNextTimer);
  autoNextTimer = setTimeout(() => {
    now = (now + 1) % count;
    showSlide(now);
  }, 4000);
}

prevBtn.addEventListener("click", () => {
  now = (now - 1 + count) % count;
  showSlide(now);
});
nextBtn.addEventListener("click", () => {
  now = (now + 1) % count;
  showSlide(now);
});
showSlide(now);

/* -----------------------------------------------------
   섹션 2시작
----------------------------------------------------- */
function initSection2() {
  const tabs = document.querySelectorAll(".section_2 .box-1__head ul li");
  const items = document.querySelectorAll(".section_2 .box-1__main ul > li");

  // 초기 설정: 첫 번째 탭 활성화
  items.forEach((item, i) => {
    item.style.display = i === 0 ? "block" : "none";
    item.classList.toggle("active", i === 0);
  });

  // 탭 클릭 시
  tabs.forEach((tab, index) => {
    tab.addEventListener("click", (e) => {
      e.preventDefault();
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      items.forEach((item, i) => {
        if (i === index) {
          item.style.display = "block";
          item.classList.add("active");
          item.style.opacity = "0";
          item.style.transition = "opacity 0.6s ease";
          requestAnimationFrame(() => (item.style.opacity = "1"));
        } else {
          item.style.display = "none";
          item.classList.remove("active");
        }
      });
    });
  });
}

function initSection2Swiper() {
  const swiper = new Swiper(".section_2 .swiper-container", {
    slidesPerView: 3,
    centeredSlides: true,
    loop: true,
    navigation: {
      nextEl: ".section_2 .head-btn.btn-next",
      prevEl: ".section_2 .head-btn.btn-prev",
    },
    spaceBetween: 30,
    breakpoints: {
      1024: {
        slidesPerView: 3,
        spaceBetween: 30,
      },
      768: {
        slidesPerView: 1,
        spaceBetween: 20,
        centeredSlides: true,
      },
      480: {
        slidesPerView: 1,
        spaceBetween: 10,
        centeredSlides: true,
      },
      300: {
        slidesPerView: 1,
        centeredSlides: true,
        spaceBetween: 10,
      },
    },
    on: {
      slideChange: function () {
        const index = this.realIndex;
        const tabs = document.querySelectorAll(".section_2 .box-1__head ul li");
        const items = document.querySelectorAll(".section_2 .box-1__main ul > li");

        tabs.forEach((t) => t.classList.remove("active"));
        tabs[index].classList.add("active");

        items.forEach((item, i) => {
          item.style.display = i === index ? "block" : "none";
          item.classList.toggle("active", i === index);
        });
      },
    },
  });
}
// 섹션 2 끝
/* -----------------------------------------------------
   섹션 4: EVENT 슬라이드
----------------------------------------------------- */
var eventSwiper = new Swiper(".event-swiper", {
  loop: false,
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
      slidesPerView: 3,
      spaceBetween: 30,
    },
    768: {
      slidesPerView: 2,
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

// ✅ 모바일 <-> PC 자동 전환 Swiper 관리
let roomSwipers = [];

function initRoomSwiper() {
  const partWraps = document.querySelectorAll(".section_2 .part-wrap");

  partWraps.forEach((wrap, index) => {
    // 이미 스와이퍼 초기화된 상태면 건너뜀
    if (wrap.classList.contains("swiper-initialized")) return;

    const parts = wrap.querySelectorAll(".part");
    if (parts.length > 0) {
      wrap.classList.add("swiper", `room-swiper-${index}`);
      const wrapperDiv = document.createElement("div");
      wrapperDiv.classList.add("swiper-wrapper");

      parts.forEach((part) => {
        part.classList.add("swiper-slide");
        wrapperDiv.appendChild(part);
      });

      wrap.innerHTML = "";
      wrap.appendChild(wrapperDiv);

      // 페이지네이션 추가
      const pagination = document.createElement("div");
      pagination.classList.add("swiper-pagination");
      wrap.appendChild(pagination);

      // Swiper 실행
      const swiper = new Swiper(`.room-swiper-${index}`, {
        slidesPerView: 1, // 살짝 옆이 보이는 카드형
        spaceBetween: 0,
        centeredSlides: false,
        pagination: {
          el: `.room-swiper-${index} .swiper-pagination`,
          clickable: true,
        },
      });

      roomSwipers.push(swiper);
    }
  });
}

function destroyRoomSwiper() {
  // 기존에 실행된 swiper 전부 제거
  roomSwipers.forEach((swiper) => swiper.destroy(true, true));
  roomSwipers = [];

  // 원래 구조로 복원
  const partWraps = document.querySelectorAll(".section_2 .part-wrap.swiper");
  partWraps.forEach((wrap) => {
    const slides = wrap.querySelectorAll(".swiper-slide.part");
    const newWrap = document.createElement("div");
    newWrap.classList.add("part-wrap");

    slides.forEach((slide) => {
      slide.classList.remove("swiper-slide");
      newWrap.appendChild(slide);
    });

    wrap.replaceWith(newWrap);
  });
}

function handleResize() {
  if (window.innerWidth <= 768 && roomSwipers.length === 0) {
    initRoomSwiper();
  } else if (window.innerWidth > 768 && roomSwipers.length > 0) {
    destroyRoomSwiper();
  }
}

// 초기 실행 + 리사이즈 감시
handleResize();
window.addEventListener("resize", () => {
  clearTimeout(window._resizeTimer);
  window._resizeTimer = setTimeout(handleResize, 300);
});

/* -----------------------------------------------------
   실행
----------------------------------------------------- */
window.addEventListener("load", () => {
  initSection2();
  initSection2Swiper();
});
