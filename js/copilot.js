document.addEventListener("DOMContentLoaded", () => {
    const chatInput = document.querySelector('.chat-input');
    const sendBtn = document.querySelector('.chat-send-btn');
    const chatHistory = document.querySelector('.chat-history');
    const chips = document.querySelectorAll('.chat-chip');
    const refreshBtn = document.querySelector('.refresh-chat-btn');
    const welcomeView = document.querySelector('.welcome-view');

    let isFirstMessage = true;

    // CSS for animations
    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes messagePop { 
            0% { opacity: 0; transform: translateY(15px) scale(0.95); } 
            100% { opacity: 1; transform: translateY(0) scale(1); } 
        }
        .message-animate { animation: messagePop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.2) forwards; }
    `;
    document.head.appendChild(style);

    // --- Modern Bubble Classes ---
    // We now use CSS classes instead of inline styles to ensure template preservation
    const applyUserStyle = (el) => { el.className = 'user-bubble message-animate'; };
    const applyAIStyle = (el) => { el.className = 'ai-bubble message-animate'; };

    // AUTO-CLEAR ON REFRESH: Per user request, we do not load from sessionStorage on DOM Load
    // We only keep the history in session for manual navigation if needed, but start fresh here.
    sessionStorage.removeItem('copilotChatHistory');

    const clearChat = () => {
        chatHistory.innerHTML = '';
        // Restore Welcome View
        const welcomeTemplate = `
            <div class="welcome-view">
                
                <h2>How can I assist the Grid today?</h2>
                <p style="color: #475569; text-align: center; max-width: 500px; margin-bottom: 1.5rem;">
                    Ask anything about Sri Lanka's energy grid, historical findings, or future forecasts.
                </p>

                <div class="capabilities-box">
                    <p>I can answer questions about:</p>
                    <ul class="capabilities-list">
                        <li>Renewable energy forecasts</li>
                        <li>Plant-level predictions (Sri Lanka)</li>
                        <li>2022 economic crisis impact</li>
                        <li>Future scenarios (2025-2030-2050)</li>
                        <li>CEB reports and PUCSL tariffs</li>
                    </ul>
                </div>
            </div>
        `;
        chatHistory.innerHTML = welcomeTemplate;
        isFirstMessage = true;
        sessionStorage.removeItem('copilotChatHistory');
    };

    const parseMarkdown = (text) => {
        let html = text.replace(/## (.*?)\n/g, '<h3 style="color:#0f172a; margin-top:1rem; margin-bottom:0.5rem;">$1</h3>');
        html = html.replace(/\*\*(.*?)\*\*/g, '<b style="color:#0f172a;">$1</b>');
        html = html.replace(/\*(.*?)\*/g, '<i>$1</i>');
        html = html.replace(/\[Source: (.*?)\]/g, '<br><br><span style="display:inline-block; background: rgba(2, 132, 199, 0.08); color: var(--primary-color); padding: 0.3rem 0.75rem; border-radius: 20px; font-size: 0.8rem; font-weight: 700;">📄 Source: $1</span><br>');
        html = html.replace(/\n\n/g, '<br><br>');
        html = html.replace(/\n\* /g, '<br>• ');
        html = html.replace(/\n- /g, '<br>• ');
        return html;
    };

    const sendMessage = async (message) => {
        if (!message) return;
        message = message.trim();
        if (!message) return;

        if (isFirstMessage) {
            chatHistory.innerHTML = ''; 
            isFirstMessage = false;
        }

        // 1. Render User Bubble
        const userBubble = document.createElement('div');
        applyUserStyle(userBubble);
        userBubble.textContent = message;
        chatHistory.appendChild(userBubble);
        chatHistory.scrollTop = chatHistory.scrollHeight;
        
        chatInput.value = '';

        // 2. Render Loading AI Bubble
        const aiBubble = document.createElement('div');
        applyAIStyle(aiBubble);
        aiBubble.innerHTML = `<span style="display:flex; gap: 0.75rem; align-items:center; color: var(--primary-color); font-weight: 600;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="animate-spin">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
            </svg> Analyzing Grid Data...
        </span>`;
        chatHistory.appendChild(aiBubble);
        chatHistory.scrollTop = chatHistory.scrollHeight;

        try {
            const res = await fetch('http://localhost:8001/api/copilot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: message })
            });
            const data = await res.json();
            
            const answer = data.answer || "Error communicating with Gemini.";
            const sources = data.sources || [];

            // Build Source Tags
            let sourcesHTML = '';
            if (sources.length > 0) {
                const isError = sources.includes("Quota Limit reached") || sources.includes("System Error");
                const tagColor = isError ? "#d97706" : "var(--primary-color)";
                const bgColor = isError ? "rgba(217, 119, 6, 0.06)" : "rgba(2, 132, 199, 0.06)";
                const borderColor = isError ? "rgba(217, 119, 6, 0.1)" : "rgba(2, 132, 199, 0.1)";

                sourcesHTML = `
                <div style="margin-top: 1.25rem; padding-top: 0.75rem; border-top: 1px solid rgba(0,0,0,0.05); display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center;">
                    <span style="font-size: 0.7rem; font-weight: 700; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.05em;">${isError ? 'Notice' : 'Sources'}:</span>
                    ${sources.map(src => `<span style="background: ${bgColor}; color: ${tagColor}; padding: 0.2rem 0.6rem; border-radius: 12px; font-size: 0.75rem; font-weight: 600; border: 1px solid ${borderColor};">${src}</span>`).join('')}
                </div>`;
            }

            const isQuotaError = sources.includes("Quota Limit reached");
            
            // Replaced '$' logo with SLEnergy AI icon
            const aiIcon = isQuotaError 
                ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01"></path></svg>'
                : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path></svg>`;

            aiBubble.innerHTML = `
                <div style="font-weight: 800; color: #0f172a; margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.6rem; font-family: 'Outfit', sans-serif;">
                    ${aiIcon}
                    ${isQuotaError ? '<span style="color: #d97706;">System Notice</span>' : 'Grid Copilot AI'}
                </div>
                <div style="${isQuotaError ? 'color: #92400e;' : 'color: #334155;'}">${parseMarkdown(answer)}</div>
                ${sourcesHTML}
            `;
            
        } catch (e) {
            aiBubble.innerHTML = `<span style="color: #ef4444; font-weight: 600;"><strong>Connection Error:</strong> Could not reach the Grid API. Ensure the backend is running.</span>`;
        }
        chatHistory.scrollTop = chatHistory.scrollHeight;
    };

    // Events
    if (sendBtn) sendBtn.addEventListener('click', () => sendMessage(chatInput.value));
    if (refreshBtn) refreshBtn.addEventListener('click', clearChat);
    
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage(chatInput.value);
    });

    chips.forEach(chip => {
        chip.addEventListener('click', () => sendMessage(chip.textContent));
    });
});
