// 활성 탭 추적 변수 선언 및 초기 활성 탭 설정
let activeTab = document.getElementById('tap-E!');

// 초기 활성 탭에 호버 효과 적용
gsap.to(activeTab, {
    duration: 0,
    color: '#000',
});

gsap.to(activeTab.querySelector('.hover-bg'), {
    duration: 0,
    opacity: 1,
    scale: 1.1,
});

gsap.to(activeTab.querySelector('.hover-text'), {
    duration: 0,
    opacity: 1,
});

document.addEventListener('DOMContentLoaded', () => {
    // 네비게이션 바 호버 및 클릭 효과
    const navItems = document.querySelectorAll('.nav-item');

    // 활성 탭 추적 변수 선언 및 초기 활성 탭 설정 (Y 탭으로 설정)
    let activeTab = document.getElementById('tap-E!');

    // 초기 활성 탭에 호버 효과 적용
    if (activeTab) {
        gsap.to(activeTab, {
            duration: 0,
            color: '#000',
        });

        gsap.to(activeTab.querySelector('.hover-bg'), {
            duration: 0,
            opacity: 1,
            scale: 1.1,
        });

        gsap.to(activeTab.querySelector('.hover-text'), {
            duration: 0,
            opacity: 1,
        });
    }

    navItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            if (item !== activeTab) {
                // 텍스트 색상 변경
                gsap.to(item, {
                    duration: 0.3,
                    color: '#000',
                });

                // 흰색 박스 나타나기
                gsap.to(item.querySelector('.hover-bg'), {
                    duration: 0.3,
                    opacity: 1,
                    scale: 1.1,
                });

                // 호버 텍스트 나타나기
                gsap.to(item.querySelector('.hover-text'), {
                    duration: 0.3,
                    opacity: 1,
                });
            }
        });

        item.addEventListener('mouseleave', () => {
            if (item !== activeTab) {
                // 텍스트 색상 복귀
                gsap.to(item, {
                    duration: 0.3,
                    color: '#fff',
                });

                // 흰색 박스 숨기기
                gsap.to(item.querySelector('.hover-bg'), {
                    duration: 0.3,
                    opacity: 0,
                    scale: 1,
                });

                // 호버 텍스트 숨기기
                gsap.to(item.querySelector('.hover-text'), {
                    duration: 0.3,
                    opacity: 0,
                });
            }
        });

        // 클릭 이벤트에서 애니메이션 제거
        item.addEventListener('click', () => {
            // 활성 탭 업데이트 (필요 시)
            activeTab = item;
            // 클릭 시 추가 애니메이션을 적용하지 않습니다.
        });
    });
});


let currentSection = 0;
const sections = document.querySelectorAll('.section');
const totalSections = sections.length;
const container = document.querySelector('.container');
let isAnimating = false;

// 스크롤 이벤트 핸들러
function handleScroll(e) {
    if (isAnimating) return;

    if (e.deltaY > 0) {
        // 스크롤 다운
        if (currentSection < totalSections - 1) {
            currentSection++;
            scrollToSection(currentSection);
        }
    } else {
        // 스크롤 업
        if (currentSection > 0) {
            currentSection--;
            scrollToSection(currentSection);
        }
    }
}

// 터치 이벤트 핸들러 (모바일)
let touchStartY = 0;
let touchEndY = 0;

function handleTouchStart(e) {
    touchStartY = e.changedTouches[0].screenY;
}

function handleTouchEnd(e) {
    touchEndY = e.changedTouches[0].screenY;
    handleGesture();
}

function handleGesture() {
    if (isAnimating) return;
    const deltaY = touchStartY - touchEndY;
    if (deltaY > 50) { // 위로 스와이프 (스크롤 다운)
        if (currentSection < totalSections - 1) {
            currentSection++;
            scrollToSection(currentSection);
        }
    } else if (deltaY < -50) { // 아래로 스와이프 (스크롤 업)
        if (currentSection > 0) {
            currentSection--;
            scrollToSection(currentSection);
        }
    }
}

// 섹션 이동 함수
function scrollToSection(index) {
    isAnimating = true;
    container.style.transform = `translateX(-${index * 100}vw)`;
    setTimeout(() => {
        isAnimating = false;
    }, 800); // CSS transition 시간과 일치시킴
}

// 이벤트 리스너 등록
window.addEventListener('wheel', handleScroll, { passive: true });
window.addEventListener('touchstart', handleTouchStart, { passive: true });
window.addEventListener('touchend', handleTouchEnd, { passive: true });

// 키보드 네비게이션 (선택 사항)
window.addEventListener('keydown', function(e) {
    if (isAnimating) return;

    if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        if (currentSection < totalSections - 1) {
            currentSection++;
            scrollToSection(currentSection);
        }
    } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        if (currentSection > 0) {
            currentSection--;
            scrollToSection(currentSection);
        }
    }
});

