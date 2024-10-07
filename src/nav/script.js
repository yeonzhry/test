// 모든 nav-item 요소를 선택
const navItems = document.querySelectorAll('.nav-item');

navItems.forEach(item => {
    item.addEventListener('mouseenter', () => {
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

        // hover-text 나타나기
        gsap.to(item.querySelector('.hover-text'), {
            duration: 0.3,
            opacity: 1,
        });
    });

    item.addEventListener('mouseleave', () => {
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

        // hover-text 숨기기
        gsap.to(item.querySelector('.hover-text'), {
            duration: 0.3,
            opacity: 0,
        });
    });
});