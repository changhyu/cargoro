'use client';

// 지도 컨트롤 위치 조정 스크립트

(function () {
  // 원하는 선택자에 직접 매칭되는 요소 찾기
  function fixMapControls() {
    try {
      // radix 컨텐츠 요소 찾기
      document.querySelectorAll('[id*="radix"][id*="content-map"]').forEach(container => {
        console.log('Radix map container found:', container.id);

        // 모든 absolute 포지션 요소 검사
        container.querySelectorAll('.absolute').forEach(el => {
          const computedStyle = window.getComputedStyle(el);

          // 오른쪽 상단 버튼들 (이미 상단에 있으므로 그대로 둠)
          if (computedStyle.right === '0.5rem' && computedStyle.top === '0.5rem') {
            console.log('Top right controls - already at top');
          }

          // 왼쪽 중간 컨트롤(확대/축소)을 상단으로 이동
          if (
            computedStyle.left === '0.5rem' &&
            (computedStyle.top === '5rem' || el.classList.contains('top-20'))
          ) {
            console.log('Moving zoom controls to top');
            el.style.cssText += 'top: 0.5rem !important; z-index: 50 !important;';
          }

          // 하단 범례를 상단으로 이동
          if (
            (computedStyle.bottom === '0.5rem' && computedStyle.left === '0.5rem') ||
            el.classList.contains('bottom-2')
          ) {
            console.log('Moving legend to top');
            el.style.cssText +=
              'bottom: auto !important; top: 0.5rem !important; left: 4rem !important; z-index: 50 !important;';
          }
        });

        // 클래스로 직접 타겟팅
        container.querySelectorAll('.absolute.left-2.top-20').forEach(el => {
          el.classList.remove('top-20');
          el.classList.add('top-2');
          console.log('Moved zoom controls via class');
        });

        container.querySelectorAll('.absolute.bottom-2.left-2').forEach(el => {
          el.classList.remove('bottom-2');
          el.classList.add('top-2');
          el.classList.remove('left-2');
          el.classList.add('left-16');
          console.log('Moved legend via class');
        });
      });

      // 선택자 직접 시도
      const specificSelectors = [
        '#radix-\\:R57puuj6\\:-content-map > div > div.lg\\:col-span-3 > div > div.p-0 > div.relative.rounded-b-lg > div.absolute.right-2.top-2.z-10.flex.space-x-2',
        '#radix-\\:R57puuj6\\:-content-map > div > div.lg\\:col-span-3 > div > div.p-0 > div.relative.rounded-b-lg > div.absolute.left-2.top-20.z-10.flex.flex-col.space-y-2',
        '#radix-\\:R57puuj6\\:-content-map > div > div.lg\\:col-span-3 > div > div.p-0 > div.relative.rounded-b-lg > div.absolute.bottom-2.left-2.z-10.rounded-lg.bg-white\\/90.p-2.shadow-md.backdrop-blur-md',
      ];

      specificSelectors.forEach(selector => {
        try {
          const el = document.querySelector(selector);
          if (el) {
            if (selector.includes('top-20')) {
              el.style.cssText += 'top: 0.5rem !important;';
              console.log('Fixed zoom controls via direct selector');
            } else if (selector.includes('bottom-2')) {
              el.style.cssText +=
                'bottom: auto !important; top: 0.5rem !important; left: 4rem !important;';
              console.log('Fixed legend via direct selector');
            }
          }
        } catch (e) {
          console.error('Error with selector:', selector, e);
        }
      });

      // ID 일부만 포함하는 선택자로 시도
      document.querySelectorAll('[id*="radix"][id*="content-map"]').forEach(container => {
        // 모든 가능한 조합의 클래스 시도
        const possibleTopClasses = [
          '.absolute.left-2.top-20',
          '.absolute.left-2.top-[5rem]',
          '.absolute.left-[0.5rem].top-[5rem]',
          '.z-10.flex.flex-col.space-y-2',
        ];

        const possibleBottomClasses = [
          '.absolute.bottom-2.left-2',
          '.absolute.bottom-[0.5rem].left-[0.5rem]',
          '.rounded-lg.bg-white\\/90.p-2.shadow-md.backdrop-blur-md',
        ];

        possibleTopClasses.forEach(cls => {
          container.querySelectorAll(cls).forEach(el => {
            el.style.cssText += 'top: 0.5rem !important;';
            console.log('Fixed zoom controls via class combination:', cls);
          });
        });

        possibleBottomClasses.forEach(cls => {
          container.querySelectorAll(cls).forEach(el => {
            el.style.cssText +=
              'bottom: auto !important; top: 0.5rem !important; left: 4rem !important;';
            console.log('Fixed legend via class combination:', cls);
          });
        });
      });
    } catch (e) {
      console.error('Error fixing map controls:', e);
    }
  }

  // DOM이 로드되면 실행
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(fixMapControls, 1000);
    });
  } else {
    setTimeout(fixMapControls, 1000);
  }

  // 추가적으로 여러 번 시도
  let attempts = 0;
  const interval = setInterval(() => {
    fixMapControls();
    attempts++;
    if (attempts >= 20) {
      // 10초 동안 시도
      clearInterval(interval);
    }
  }, 500);

  // 모든 DOM 변화를 감지
  const observer = new MutationObserver(fixMapControls);
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class', 'style'],
  });

  // window에 함수 노출하여 개발자 도구에서 직접 호출 가능하게 함
  window.fixMapControls = fixMapControls;
})();
