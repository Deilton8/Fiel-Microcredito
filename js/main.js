/* ==========================================================================
   FIEL MICROCRÉDITO, EI — main.js
   JavaScript puro (Vanilla), sem dependências externas.
   Organizado por funcionalidade; cada função é independente e é iniciada
   a partir de initApp() no fundo do ficheiro.
   ========================================================================== */

(function () {
  "use strict";

  /* ------------------------------------------------------------------------
     1. MENU MOBILE — toggle acessível com painel deslizante
     ------------------------------------------------------------------------ */
  function initMobileNav() {
    var toggle = document.getElementById("navToggle");
    var nav = document.getElementById("mainNav");
    var scrim = document.getElementById("navScrim");
    if (!toggle || !nav || !scrim) return;

    function openNav() {
      nav.classList.add("is-open");
      scrim.classList.add("is-visible");
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "Fechar menu de navegação");
      document.body.style.overflow = "hidden";
    }

    function closeNav() {
      nav.classList.remove("is-open");
      scrim.classList.remove("is-visible");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Abrir menu de navegação");
      document.body.style.overflow = "";
    }

    toggle.addEventListener("click", function () {
      var isOpen = nav.classList.contains("is-open");
      if (isOpen) {
        closeNav();
      } else {
        openNav();
      }
    });

    scrim.addEventListener("click", closeNav);

    // Fecha o menu ao clicar num link (navegação por âncora)
    var links = nav.querySelectorAll(".main-nav__link, .main-nav .btn-primary");
    links.forEach(function (link) {
      link.addEventListener("click", closeNav);
    });

    // Fecha com a tecla Escape, por acessibilidade
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        closeNav();
        toggle.focus();
      }
    });

    // Se a janela crescer para desktop, garante que o painel mobile fecha
    window.addEventListener("resize", function () {
      if (window.innerWidth >= 900 && nav.classList.contains("is-open")) {
        closeNav();
      }
    });
  }

  /* ------------------------------------------------------------------------
     2. HEADER — reduz altura e ganha sombra ao fazer scroll
     ------------------------------------------------------------------------ */
  function initHeaderScroll() {
    var header = document.getElementById("siteHeader");
    if (!header) return;

    var threshold = 12;
    var ticking = false;

    function updateHeader() {
      if (window.scrollY > threshold) {
        header.classList.add("is-scrolled");
      } else {
        header.classList.remove("is-scrolled");
      }
      ticking = false;
    }

    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          window.requestAnimationFrame(updateHeader);
          ticking = true;
        }
      },
      { passive: true }
    );

    updateHeader();
  }

  /* ------------------------------------------------------------------------
     3. NAVEGAÇÃO ACTIVA — realça o link da secção visível
     ------------------------------------------------------------------------ */
  function initActiveNavHighlight() {
    var sections = document.querySelectorAll("main section[id]");
    var navLinks = document.querySelectorAll(".main-nav__link");
    if (!sections.length || !navLinks.length) return;

    var linkMap = {};
    navLinks.forEach(function (link) {
      var href = link.getAttribute("href");
      if (href && href.charAt(0) === "#") {
        linkMap[href.slice(1)] = link;
      }
    });

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var id = entry.target.getAttribute("id");
          var link = linkMap[id];
          if (!link) return;
          if (entry.isIntersecting) {
            navLinks.forEach(function (l) {
              l.classList.remove("is-active");
            });
            link.classList.add("is-active");
          }
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );

    sections.forEach(function (section) {
      observer.observe(section);
    });
  }

  /* ------------------------------------------------------------------------
     4. SCROLL SUAVE PARA ÂNCORAS — fallback para browsers sem suporte a
        scroll-behavior: smooth, e compensa a altura do header fixo
     ------------------------------------------------------------------------ */
  function initSmoothAnchors() {
    var links = document.querySelectorAll('a[href^="#"]');
    var header = document.getElementById("siteHeader");
    var topbar = document.querySelector(".topbar");

    links.forEach(function (link) {
      link.addEventListener("click", function (e) {
        var href = link.getAttribute("href");
        if (!href) return;
        if (href === "#") {
          // Placeholder (ex.: ícones de redes sociais ainda sem link real):
          // impede o salto brusco para o topo da página, sem simular uma
          // navegação que não existe.
          e.preventDefault();
          return;
        }

        var target = document.querySelector(href);
        if (!target) return;

        e.preventDefault();

        var headerHeight = header ? header.getBoundingClientRect().height : 0;
        var topbarHeight = topbar ? topbar.getBoundingClientRect().height : 0;
        var offset = headerHeight + topbarHeight + 16;

        var targetPosition =
          target.getBoundingClientRect().top + window.pageYOffset - offset;

        window.scrollTo({
          top: targetPosition,
          behavior: "smooth",
        });

        // Move o foco para o alvo, por acessibilidade, sem saltar o scroll
        window.setTimeout(function () {
          target.setAttribute("tabindex", "-1");
          target.focus({ preventScroll: true });
        }, 480);
      });
    });
  }

  /* ------------------------------------------------------------------------
     5. ANIMAÇÕES ON-SCROLL — fade-in / slide-up via IntersectionObserver
     ------------------------------------------------------------------------ */
  function initScrollReveal() {
    var revealEls = document.querySelectorAll(".reveal, .reveal-stagger");
    if (!revealEls.length) return;

    // Se o utilizador pede movimento reduzido, mostra tudo de imediato
    var prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      revealEls.forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );

    revealEls.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ------------------------------------------------------------------------
     6. CONTADORES NUMÉRICOS ANIMADOS — secção "Sobre Nós"
     ------------------------------------------------------------------------ */
  function initCounters() {
    var counters = document.querySelectorAll("[data-count-to]");
    if (!counters.length) return;

    var prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    function animateCounter(el) {
      var target = parseInt(el.getAttribute("data-count-to"), 10);
      var noSuffix = el.getAttribute("data-no-suffix") === "true";
      if (isNaN(target)) return;

      if (prefersReducedMotion) {
        el.textContent = target + (noSuffix ? "" : "+");
        return;
      }

      var duration = 1400;
      var startTime = null;

      function step(timestamp) {
        if (startTime === null) startTime = timestamp;
        var progress = Math.min((timestamp - startTime) / duration, 1);
        // easeOutCubic — desacelera perto do fim, mais natural que linear
        var eased = 1 - Math.pow(1 - progress, 3);
        var current = Math.floor(eased * target);
        el.textContent = current + (noSuffix ? "" : progress >= 1 ? "+" : "");
        if (progress < 1) {
          window.requestAnimationFrame(step);
        } else {
          el.textContent = target + (noSuffix ? "" : "+");
        }
      }

      window.requestAnimationFrame(step);
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );

    counters.forEach(function (counter) {
      observer.observe(counter);
    });
  }

  /* ------------------------------------------------------------------------
     7. GRÁFICOS DE BARRAS — desenhados nativamente em SVG, sem bibliotecas
     ------------------------------------------------------------------------ */
  function buildGroupedBarChart(svgEl, config) {
    if (!svgEl) return;

    var width = 460;
    var height = 240;
    var margin = { top: 16, right: 12, bottom: 34, left: 30 };
    var chartWidth = width - margin.left - margin.right;
    var chartHeight = height - margin.top - margin.bottom;

    var groups = config.groups; // ex.: ["Ano 1", "Ano 2", "Ano 3"]
    var seriesA = config.seriesA; // valores da série dourada
    var seriesB = config.seriesB; // valores da série azul
    var maxValue = config.maxValue;
    var valueSuffix = config.valueSuffix || "";

    var groupWidth = chartWidth / groups.length;
    var barWidth = Math.min(30, groupWidth * 0.28);
    var barGap = 6;

    var svgNS = "http://www.w3.org/2000/svg";
    var ns = svgNS;

    function el(tag, attrs) {
      var node = document.createElementNS(ns, tag);
      Object.keys(attrs).forEach(function (key) {
        node.setAttribute(key, attrs[key]);
      });
      return node;
    }

    // Linha de base do eixo X
    svgEl.appendChild(
      el("line", {
        x1: margin.left,
        y1: margin.top + chartHeight,
        x2: margin.left + chartWidth,
        y2: margin.top + chartHeight,
        stroke: "#e4e2db",
        "stroke-width": "1",
      })
    );

    // Linhas-guia horizontais discretas (grelha), 3 níveis
    var gridLevels = 3;
    for (var g = 1; g <= gridLevels; g++) {
      var gy = margin.top + chartHeight - (chartHeight / gridLevels) * g;
      svgEl.appendChild(
        el("line", {
          x1: margin.left,
          y1: gy,
          x2: margin.left + chartWidth,
          y2: gy,
          stroke: "#e4e2db",
          "stroke-width": "1",
          "stroke-dasharray": "3,4",
        })
      );
    }

    groups.forEach(function (label, i) {
      var groupX = margin.left + groupWidth * i + groupWidth / 2;
      var barGroup = el("g", { class: "bar-group" });

      var valueA = seriesA[i];
      var valueB = seriesB[i];
      var heightA = (valueA / maxValue) * chartHeight;
      var heightB = (valueB / maxValue) * chartHeight;

      var xA = groupX - barWidth - barGap / 2;
      var xB = groupX + barGap / 2;
      var yBase = margin.top + chartHeight;

      // Barra A (dourada) — parte de altura 0 e anima até ao valor final
      var rectA = el("rect", {
        x: xA,
        y: yBase,
        width: barWidth,
        height: 0,
        rx: 3,
        fill: "#c9a24b",
      });
      barGroup.appendChild(rectA);

      // Barra B (azul-marinho)
      var rectB = el("rect", {
        x: xB,
        y: yBase,
        width: barWidth,
        height: 0,
        rx: 3,
        fill: "#223a68",
      });
      barGroup.appendChild(rectB);

      // Rótulo de valor sobre cada barra
      var textA = el("text", {
        x: xA + barWidth / 2,
        y: yBase - heightA - 8,
        "text-anchor": "middle",
        "font-size": "11",
        class: "bar-value",
        opacity: "0",
      });
      textA.textContent = valueA + valueSuffix;
      barGroup.appendChild(textA);

      var textB = el("text", {
        x: xB + barWidth / 2,
        y: yBase - heightB - 8,
        "text-anchor": "middle",
        "font-size": "11",
        class: "bar-value",
        opacity: "0",
      });
      textB.textContent = valueB + valueSuffix;
      barGroup.appendChild(textB);

      // Rótulo do grupo (eixo X)
      var groupLabel = el("text", {
        x: groupX,
        y: yBase + 20,
        "text-anchor": "middle",
        "font-size": "12",
      });
      groupLabel.textContent = label;
      barGroup.appendChild(groupLabel);

      svgEl.appendChild(barGroup);

      // Anima a altura das barras com um pequeno atraso progressivo
      var prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (prefersReducedMotion) {
        rectA.setAttribute("y", yBase - heightA);
        rectA.setAttribute("height", heightA);
        rectB.setAttribute("y", yBase - heightB);
        rectB.setAttribute("height", heightB);
        textA.setAttribute("opacity", "1");
        textB.setAttribute("opacity", "1");
      } else {
        rectA.style.transition =
          "height 700ms cubic-bezier(0.16,1,0.3,1) " + i * 110 + "ms, y 700ms cubic-bezier(0.16,1,0.3,1) " + i * 110 + "ms";
        rectB.style.transition =
          "height 700ms cubic-bezier(0.16,1,0.3,1) " + (i * 110 + 90) + "ms, y 700ms cubic-bezier(0.16,1,0.3,1) " + (i * 110 + 90) + "ms";
        textA.style.transition = "opacity 400ms ease " + (i * 110 + 500) + "ms";
        textB.style.transition = "opacity 400ms ease " + (i * 110 + 590) + "ms";

        window.requestAnimationFrame(function () {
          window.requestAnimationFrame(function () {
            rectA.setAttribute("y", yBase - heightA);
            rectA.setAttribute("height", heightA);
            rectB.setAttribute("y", yBase - heightB);
            rectB.setAttribute("height", heightB);
            textA.setAttribute("opacity", "1");
            textB.setAttribute("opacity", "1");
          });
        });
      }
    });
  }

  function initImpactCharts() {
    var chartGender = document.getElementById("chartGender");
    var chartJobs = document.getElementById("chartJobs");
    if (!chartGender && !chartJobs) return;

    var chartsBuilt = false;

    function buildCharts() {
      if (chartsBuilt) return;
      chartsBuilt = true;

      if (chartGender) {
        buildGroupedBarChart(chartGender, {
          groups: ["Ano 1", "Ano 2", "Ano 3"],
          seriesA: [60, 60, 65],
          seriesB: [30, 30, 35],
          maxValue: 80,
          valueSuffix: "%",
        });
      }

      if (chartJobs) {
        buildGroupedBarChart(chartJobs, {
          groups: ["Ano 1", "Ano 2", "Ano 3"],
          seriesA: [4, 6, 8],
          seriesB: [40, 100, 200],
          maxValue: 220,
          valueSuffix: "",
        });
      }
    }

    var target = chartGender || chartJobs;
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            buildCharts();
            observer.disconnect();
          }
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(target);
  }

  /* ------------------------------------------------------------------------
     8. VALIDAÇÃO DE FORMULÁRIO — em tempo real, com mensagens claras
     ------------------------------------------------------------------------ */
  function initContactForm() {
    var form = document.getElementById("contactForm");
    if (!form) return;

    var statusEl = document.getElementById("formStatus");

    var validators = {
      name: function (value) {
        if (!value.trim()) return "Por favor, indique o seu nome.";
        if (value.trim().length < 3) return "O nome deve ter pelo menos 3 caracteres.";
        return "";
      },
      phone: function (value) {
        var digits = value.replace(/\D/g, "");
        if (!digits) return "Por favor, indique um número de telefone.";
        if (digits.length < 9) return "Indique um número de telefone válido.";
        return "";
      },
      product: function (value) {
        if (!value) return "Seleccione o tipo de crédito pretendido.";
        return "";
      },
      message: function (value) {
        if (!value.trim()) return "Escreva uma breve mensagem sobre o seu pedido.";
        if (value.trim().length < 10) return "Dê-nos um pouco mais de detalhe (mínimo 10 caracteres).";
        return "";
      },
    };

    var fieldWrapperMap = {
      name: "fieldName",
      phone: "fieldPhone",
      product: "fieldProduct",
      message: "fieldMessage",
    };

    function showFieldError(fieldName, message) {
      var wrapper = document.getElementById(fieldWrapperMap[fieldName]);
      if (!wrapper) return;
      var errorEl = wrapper.querySelector(".form-field__error");
      if (message) {
        wrapper.classList.add("has-error");
        if (errorEl) errorEl.textContent = message;
      } else {
        wrapper.classList.remove("has-error");
        if (errorEl) errorEl.textContent = "";
      }
    }

    function validateField(input) {
      var name = input.name;
      var validator = validators[name];
      if (!validator) return true;
      var message = validator(input.value);
      showFieldError(name, message);
      return !message;
    }

    // Validação em tempo real ao sair do campo (blur) e ao digitar depois de um erro
    Object.keys(fieldWrapperMap).forEach(function (name) {
      var input = form.querySelector('[name="' + name + '"]');
      if (!input) return;

      input.addEventListener("blur", function () {
        validateField(input);
      });

      input.addEventListener("input", function () {
        var wrapper = document.getElementById(fieldWrapperMap[name]);
        if (wrapper && wrapper.classList.contains("has-error")) {
          validateField(input);
        }
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var isValid = true;
      Object.keys(fieldWrapperMap).forEach(function (name) {
        var input = form.querySelector('[name="' + name + '"]');
        if (input && !validateField(input)) {
          isValid = false;
        }
      });

      if (!isValid) {
        var firstError = form.querySelector(".has-error input, .has-error select, .has-error textarea");
        if (firstError) firstError.focus();
        return;
      }

      handleContactSubmit(form, statusEl);
    });
  }

  // --------------------------------------------------------------------
  // ENVIO DO FORMULÁRIO — via WhatsApp (link "wa.me", sem backend, sem
  // conta em serviço nenhum, sem nada a configurar). Usa o número
  // principal já apresentado no site. Ao submeter, o WhatsApp abre
  // (aplicação no telemóvel, ou WhatsApp Web no computador) com a
  // mensagem já escrita — a pessoa só precisa de confirmar o envio lá.
  // --------------------------------------------------------------------
  var WHATSAPP_NUMBER = "258827233067"; // +258 82 723 3067, em formato internacional (sem "+", espaços ou zeros à esquerda)

  var PRODUCT_LABELS = {
    empresarial: "Crédito Empresarial",
    consumo: "Crédito ao Consumo / Emergência",
    duvida: "Ainda não sei — quero esclarecer dúvidas",
  };

  function buildWhatsAppUrl(data) {
    var productLabel = PRODUCT_LABELS[data.product] || data.product;
    var text = [
      "Olá! Vim do site da Fiel Microcrédito e gostaria de simular um crédito.",
      "",
      "Nome: " + data.name,
      "Telefone: " + data.phone,
      "Tipo de crédito: " + productLabel,
      "Mensagem: " + data.message,
    ].join("\n");
    return "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(text);
  }

  function handleContactSubmit(form, statusEl) {
    var data = Object.fromEntries(new FormData(form));
    var url = buildWhatsAppUrl(data);

    window.open(url, "_blank", "noopener");

    var fallbackLink = document.getElementById("formWhatsappFallback");
    if (fallbackLink) fallbackLink.href = url;

    if (statusEl) {
      statusEl.classList.add("is-visible");
      window.setTimeout(function () {
        statusEl.classList.remove("is-visible");
      }, 12000);
    }

    form.reset();
    form.querySelectorAll(".has-error").forEach(function (el) {
      el.classList.remove("has-error");
    });
  }

  /* ------------------------------------------------------------------------
     9. BOTÃO VOLTAR AO TOPO
     ------------------------------------------------------------------------ */
  function initToTopButton() {
    var btn = document.getElementById("toTopBtn");
    if (!btn) return;

    var threshold = 480;
    var ticking = false;

    function updateVisibility() {
      if (window.scrollY > threshold) {
        btn.classList.add("is-visible");
      } else {
        btn.classList.remove("is-visible");
      }
      ticking = false;
    }

    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          window.requestAnimationFrame(updateVisibility);
          ticking = true;
        }
      },
      { passive: true }
    );

    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    updateVisibility();
  }

  /* ------------------------------------------------------------------------
     10. ANO DINÂMICO NO RODAPÉ
     ------------------------------------------------------------------------ */
  function initFooterYear() {
    var el = document.getElementById("footerYear");
    if (!el) return;
    var year = new Date().getFullYear();
    el.textContent =
      "© " + year + " Fiel Microcrédito, EI. Todos os direitos reservados.";
  }

  /* ------------------------------------------------------------------------
     INICIALIZAÇÃO
     ------------------------------------------------------------------------ */
  function initApp() {
    initMobileNav();
    initHeaderScroll();
    initActiveNavHighlight();
    initSmoothAnchors();
    initScrollReveal();
    initCounters();
    initImpactCharts();
    initContactForm();
    initToTopButton();
    initFooterYear();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initApp);
  } else {
    initApp();
  }
})();
