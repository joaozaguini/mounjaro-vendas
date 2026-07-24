document.addEventListener('DOMContentLoaded', () => {
  // 0. ANTI-KIBE: Bloqueios de inspeção e cópia
  document.addEventListener('contextmenu', event => event.preventDefault()); // Bloqueia botão direito
  document.addEventListener('keydown', event => {
    // Bloqueia F12, Ctrl+Shift+I, Ctrl+U, Ctrl+S, Ctrl+C
    if (
      event.key === 'F12' ||
      (event.ctrlKey && event.shiftKey && event.key === 'I') ||
      (event.ctrlKey && event.key === 'u') ||
      (event.ctrlKey && event.key === 'U') ||
      (event.ctrlKey && event.key === 's') ||
      (event.ctrlKey && event.key === 'S') ||
      (event.ctrlKey && event.key === 'c') ||
      (event.ctrlKey && event.key === 'C')
    ) {
      event.preventDefault();
    }
  });

  // 0.5 SAFE-WORDS: Descriptografar palavras sensíveis para fugir de robôs
  const safeWords = document.querySelectorAll('.safe-word');
  safeWords.forEach(span => {
    try {
      // Pega o atributo data-w (em base64)
      const base64Text = span.getAttribute('data-w');
      // Decodifica usando atob() nativo, e com escape/decodeURIComponent pra suportar acentos UTF-8
      const decodedText = decodeURIComponent(escape(atob(base64Text)));
      span.textContent = decodedText;
    } catch (e) {
      console.warn('Erro ao decodificar safe-word');
    }
  });
  // 1. Date in the Urgency Bar (pt-BR Format)
  const todayElement = document.getElementById('today-date');
  if (todayElement) {
    const today = new Date();
    // pt-BR Format: DD/MM/YYYY
    todayElement.textContent = today.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  // 2. Urgency Timer
  const timerElement = document.getElementById('timer');
  if (timerElement) {
    let tempoRestante = 899; // 15 minutos (899 segundos)
    const intervalo = setInterval(() => {
      const minutos = Math.floor(tempoRestante / 60);
      const segundos = tempoRestante % 60;
      timerElement.textContent = `00:${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
      tempoRestante--;
      if (tempoRestante < 0) clearInterval(intervalo);
    }, 1000);
  }

  // 3. FAQ Accordion Logic
  const faqQuestions = document.querySelectorAll('.faq-question');
  faqQuestions.forEach(question => {
    question.addEventListener('click', () => {
      const answer = question.nextElementSibling;
      const isActive = question.classList.contains('active');
      
      // Close all others
      document.querySelectorAll('.faq-question').forEach(q => {
        q.classList.remove('active');
        q.nextElementSibling.style.display = 'none';
      });

      // Open/close current
      if (!isActive) {
        question.classList.add('active');
        answer.style.display = 'block';
      }
    });
  });

  // 4. Reveal Animations (Intersection Observer)
  const revealOptions = {
    threshold: 0.05,
    rootMargin: "0px 0px 50px 0px"
  };
  
  const revealObserver = new IntersectionObserver(function(entries, observer) {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('active');
      observer.unobserve(entry.target); // Only animate once
    });
  }, revealOptions);

  document.querySelectorAll('.reveal').forEach(reveal => {
    revealObserver.observe(reveal);
  });

  // 4.5 Focus Highlight Animations (Intersection Observer)
  // Triggers when element is near the center of the viewport
  const focusOptions = {
    threshold: 0.5,
    rootMargin: "-25% 0px -25% 0px" 
  };

  const focusObserver = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-focus');
        
        // Garante que apenas um card de cada grupo fique em destaque por vez
        const focusGroups = ['bonus-card', 'step-card'];
        focusGroups.forEach(className => {
          if (entry.target.classList.contains(className)) {
            document.querySelectorAll(`.${className}.in-focus`).forEach(card => {
              if (card !== entry.target) {
                card.classList.remove('in-focus');
              }
            });
          }
        });
      } else {
        entry.target.classList.remove('in-focus');
      }
    });
  }, focusOptions);

  // Focus observer setup will be handled dynamically or by static class assignment in HTML
  document.querySelectorAll('.focus-item').forEach(item => {
    focusObserver.observe(item);
  });

  // 5. Downsell Popup Logic
  const btnStarter = document.getElementById('btnStarter');
  const downsellPopup = document.getElementById('downsellPopup');
  const closePopupBtn = document.getElementById('closePopupBtn');

  let popupInterval;
  if (btnStarter && downsellPopup) {
    btnStarter.addEventListener('click', (e) => {
      e.preventDefault();
      downsellPopup.style.display = 'flex';
      
      // Timer de 60 segundos do Popup
      const popupTimerEl = document.getElementById('popup-timer');
      if (popupTimerEl) {
        let timeLeft = 60;
        popupTimerEl.textContent = '01:00';
        clearInterval(popupInterval);
        popupInterval = setInterval(() => {
          timeLeft--;
          if (timeLeft <= 0) {
            clearInterval(popupInterval);
            popupTimerEl.textContent = '00:00';
          } else {
            const m = Math.floor(timeLeft / 60);
            const s = timeLeft % 60;
            popupTimerEl.textContent = `0${m}:${s.toString().padStart(2, '0')}`;
          }
        }, 1000);
      }
    });
  }

  if (closePopupBtn && downsellPopup) {
    closePopupBtn.addEventListener('click', () => {
      downsellPopup.style.display = 'none';
    });
  }

  // Close popup if clicking outside the box
  window.addEventListener('click', (e) => {
    if (e.target === downsellPopup) {
      downsellPopup.style.display = 'none';
    }
  });

  // 6. Urgency Bar Scroll Hide/Show Logic
  let lastScrollY = window.scrollY;
  let scrollUpDistance = 0;
  const urgencyBar = document.querySelector('.urgency-bar');
  
  if (urgencyBar) {
    window.addEventListener('scroll', () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > 50) {
        if (currentScrollY > lastScrollY) {
          // Scrolling down
          urgencyBar.classList.add('collapsed');
          scrollUpDistance = 0; // Reset upward scroll counter
        } else {
          // Scrolling up
          scrollUpDistance += (lastScrollY - currentScrollY);
          
          // Only show if user scrolled up more than 100px intentionally
          if (scrollUpDistance > 100) {
            urgencyBar.classList.remove('collapsed');
          }
        }
      } else {
        // At the very top
        urgencyBar.classList.remove('collapsed');
        scrollUpDistance = 0;
      }
      
      lastScrollY = currentScrollY;
    }, { passive: true });
  }

  // 7. Review Carousel Logic
  const wrapper = document.getElementById('reviewWrapper');
  const prevBtn = document.getElementById('prevReviewBtn');
  const nextBtn = document.getElementById('nextReviewBtn');

  if (wrapper && prevBtn && nextBtn) {
    const cardWidth = 340; // 320px card + 20px gap
    nextBtn.addEventListener('click', () => {
      wrapper.scrollBy({ left: cardWidth, behavior: 'smooth' });
    });
    prevBtn.addEventListener('click', () => {
      wrapper.scrollBy({ left: -cardWidth, behavior: 'smooth' });
    });
  }

  // 8. Sneak Peek Carousel Logic
  const sneakTrack = document.getElementById('sneakPeekTrack');
  const sneakPrev = document.getElementById('btnPrevSneak');
  const sneakNext = document.getElementById('btnNextSneak');

  if (sneakTrack && sneakPrev && sneakNext) {
    const scrollAmount = 340; 
    sneakNext.addEventListener('click', () => {
      sneakTrack.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    });
    sneakPrev.addEventListener('click', () => {
      sneakTrack.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    });
  }
});
