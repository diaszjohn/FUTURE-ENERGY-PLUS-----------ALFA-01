(() => {
  "use strict";

  const API_URL = "http://localhost:3000/api/leads";
  const WHATSAPP_FUTURE = "558694566106"; // Número comercial oficial

  // 1. Menu Mobile
  const mobileMenuBtn = document.getElementById("mobile-menu-btn");
  const mobileNav = document.getElementById("mobile-nav");

  if (mobileMenuBtn && mobileNav) {
    mobileMenuBtn.addEventListener("click", () => {
      const isHidden = mobileNav.classList.toggle("hidden");
      mobileMenuBtn.setAttribute("aria-expanded", String(!isHidden));
    });

    mobileNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        mobileNav.classList.add("hidden");
        mobileMenuBtn.setAttribute("aria-expanded", "false");
      });
    });
  }

  // 2. Transição automática em Fade dos vídeos de fundo (.mp4)
  const bgVideos = document.querySelectorAll(".bg-video");
  if (bgVideos.length > 1) {
    let currentVideoIdx = 0;
    setInterval(() => {
      bgVideos[currentVideoIdx].classList.remove("active");
      currentVideoIdx = (currentVideoIdx + 1) % bgVideos.length;
      bgVideos[currentVideoIdx].classList.add("active");
    }, 7000);
  }

  // 3. Controle de carregamento das imagens
  document.querySelectorAll(".service-photo").forEach((img) => {
    const handleSuccess = () => { img.classList.remove("hidden"); img.classList.add("is-loaded"); };
    const handleFailure = () => { img.classList.add("hidden"); };

    if (img.complete) {
      if (img.naturalWidth > 0) handleSuccess();
      else handleFailure();
    } else {
      img.addEventListener("load", handleSuccess);
      img.addEventListener("error", handleFailure);
    }
  });

  // 4. Simulador Interativo
  const faturaRange = document.getElementById("calc-fatura-range");
  const faturaDisplay = document.getElementById("calc-fatura-display");
  const economiaMensalEl = document.getElementById("calc-economia-mensal");
  const economiaAnualEl = document.getElementById("calc-economia-anual");
  const faturaInput = document.getElementById("lead-fatura");

  function formatBRL(value) {
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  function updateSimulator(valorConta) {
    const economiaMensal = valorConta * 0.8;
    const economiaAnual = economiaMensal * 12;

    if (faturaDisplay) faturaDisplay.textContent = formatBRL(valorConta);
    if (economiaMensalEl) economiaMensalEl.textContent = formatBRL(economiaMensal);
    if (economiaAnualEl) economiaAnualEl.textContent = formatBRL(economiaAnual);
    if (faturaInput) faturaInput.value = formatBRL(valorConta);
  }

  if (faturaRange) {
    updateSimulator(Number(faturaRange.value));
    faturaRange.addEventListener("input", (e) => updateSimulator(Number(e.target.value)));
  }

  // 5. Pré-seleção de serviços nos botões
  const servicoSelect = document.getElementById("lead-servico");
  document.querySelectorAll("[data-servico]").forEach((link) => {
    link.addEventListener("click", () => {
      const tipo = link.getAttribute("data-servico");
      if (servicoSelect && tipo) servicoSelect.value = tipo;
    });
  });

  // 6. Formulário e WhatsApp Comercial Direto
  const leadForm = document.getElementById("lead-form");
  const nomeInput = document.getElementById("lead-nome");
  const whatsappInput = document.getElementById("lead-whatsapp");
  const submitBtn = document.getElementById("lead-submit-btn");
  const feedbackEl = document.getElementById("form-feedback");

  if (whatsappInput) {
    whatsappInput.addEventListener("input", (e) => {
      const digits = e.target.value.replace(/\D/g, "").slice(0, 11);
      if (digits.length > 6) {
        e.target.value = `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
      } else if (digits.length > 2) {
        e.target.value = `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
      } else if (digits.length > 0) {
        e.target.value = `(${digits}`;
      } else {
        e.target.value = "";
      }
    });
  }

  function showFeedback(message, isError = false) {
    feedbackEl.textContent = message;
    feedbackEl.classList.remove("hidden", "error");
    if (isError) feedbackEl.classList.add("error");
  }

  function redirectToWhatsApp(payload) {
    const faturaInfo = payload.fatura ? ` | Conta média: ${payload.fatura}` : "";
    const text = encodeURIComponent(
      `Olá! Meu nome é ${payload.nome}, quero falar com o comercial sobre um sistema solar ${payload.servico}${faturaInfo}.`
    );
    window.location.href = `https://wa.me/${WHATSAPP_FUTURE}?text=${text}`;
  }

  if (leadForm) {
    leadForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const nome = nomeInput.value.trim();
      const whatsapp = whatsappInput.value.trim();
      const fatura = faturaInput ? faturaInput.value.trim() : "";
      const servico = servicoSelect.value;
      const digits = whatsapp.replace(/\D/g, "");

      if (nome.length < 2) {
        showFeedback("Por favor, informe seu nome.", true);
        nomeInput.focus();
        return;
      }

      if (digits.length < 10) {
        showFeedback("Informe um número de WhatsApp válido com DDD.", true);
        whatsappInput.focus();
        return;
      }

      const payload = { nome, whatsapp, fatura, servico };

      submitBtn.disabled = true;
      submitBtn.textContent = "Registrando dados...";

      try {
        const response = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) throw new Error("Falha ao registrar lead");

        showFeedback("Redirecionando para o WhatsApp do comercial...");
        setTimeout(() => redirectToWhatsApp(payload), 900);
      } catch (_err) {
        showFeedback("Redirecionando para o atendimento comercial...");
        setTimeout(() => redirectToWhatsApp(payload), 900);
      } finally {
        setTimeout(() => {
          submitBtn.disabled = false;
          submitBtn.textContent = "Falar com o Comercial no WhatsApp →";
        }, 1500);
      }
    });
  }
})();