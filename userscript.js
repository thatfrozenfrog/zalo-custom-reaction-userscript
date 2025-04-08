// ==UserScript==
// @name         Zalo Custom Reactions
// @namespace    https://e-z.bio/anhwaivo
// @version      1.4
// @description  Zalo web custom reaction
// @author       Anhwaivo
// @match        https://*.zalo.me/*
// @match        https://chat.zalo.me/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
"use strict";
	const reactions = [
		{type: 100, icon: "👏", name: "clap", class: "emoji-sizer emoji-outer", bgPos: "80% 12.5%"},
		{type: 101, icon: "🎉", name: "huh", class: "emoji-sizer emoji-outer", bgPos: "74% 62.5%"},
    	{type: 102, icon: "hello", name: "text", class: "emoji-sizer emoji-outer", bgPos: "84% 82.5%"}
	];

	const observer = new MutationObserver(mutations => mutations.forEach(m => {
		if (m.type === "childList" && m.addedNodes.length > 0 && Array.from(m.addedNodes).some(n => n.querySelector?.(".reaction-emoji-list"))) {
			setTimeout(() => {
				document.querySelectorAll(".reaction-emoji-list").forEach(list => {
					if (list.getAttribute("data-extended") !== "true") {
						list.setAttribute("data-extended", "true");
						const wrapper = list.closest(".emoji-list-wrapper");
						if (wrapper) {
							const btn = wrapper.querySelector('[id^="reaction-btn-"]');
							const id = btn?.id.replace("reaction-btn-", "");
							reactions.forEach((react, idx) => {
								const div = document.createElement("div");
								const span = document.createElement("span");
								div.className = "reaction-emoji-icon";
								div.setAttribute("data-custom", "true");
								div.style.animationDelay = `${20 * (idx + 7)}ms`;
								span.className = react.class;
								span.style.cssText = `background: url("assets/emoji.1e7786c93c8a0c1773f165e2de2fd129.png?v=20180604") ${react.bgPos} / 5100% no-repeat; margin: -1px; position: relative; top: 2px`;
								div.appendChild(span);
								list.appendChild(div);
								div.addEventListener("click", e => {
									e.preventDefault();
									e.stopPropagation();
									const wrapper = list.closest(".emoji-list-wrapper");
									if (wrapper) {
										const getReactFiber = el => { for (const k in el) if (k.startsWith("__react")) return el[k]; return null };
										let fiber = getReactFiber(wrapper);
										if (fiber) {
											while (fiber) {
												if (fiber.memoizedProps?.sendReaction) {
													fiber.memoizedProps.sendReaction({rType: react.type, rIcon: react.icon});
													id && updateBtn(id, react);
													break;
												}
												fiber = fiber.return;
											}
										}
										if (window.S?.default?.reactionMsgInfo) {
											const msg = wrapper.closest(".msg-item");
											const msgFiber = msg && getReactFiber(msg);
											msgFiber?.memoizedProps?.sendReaction({rType: react.type, rIcon: react.icon});
											id && updateBtn(id, react);
											wrapper.classList.add("hide-elist");
											wrapper.classList.remove("show-elist");
										}
									}
								});
							});
						}
					}
				});
			}, 50);
		}
	}));

	function updateBtn(id, react) {
		const span = document.querySelector(`#reaction-btn-${id} span`);
		if (span) {
			span.innerHTML = "";
			const emoji = document.createElement("span");
			emoji.className = react.class;
			emoji.style.cssText = `background: url("assets/emoji.1e7786c93c8a0c1773f165e2de2fd129.png?v=20180604") ${react.bgPos} / 5100% no-repeat; margin: -1px; position: relative; top: 2px`;
			span.appendChild(emoji);
		}
	}

	function initReactions() {
		if (window.S?.default) {
			if (!window.S.default.reactionMsgInfo.some(r => r.rType >= 100)) {
				window.S.default.reactionMsgInfo = [...window.S.default.reactionMsgInfo, ...reactions.map(r => ({rType: r.type, rIcon: r.icon, name: r.name}))];
			}
		} else setTimeout(initReactions, 1000);
	}

	const style = document.createElement("style");
	style.textContent = `
		.reaction-emoji-list { display: flex !important; max-width: 300px !important; justify-content: center !important; }
		.emoji-list-wrapper { width: auto !important; transition: opacity 0.2s ease-in-out !important; }
		.reaction-emoji-icon:hover { transform: scale(1.2) !important; transition: transform 0.2s ease-in-out !important; }
		[data-custom="true"] { position: relative; }
		[data-custom="true"]::after { content: ''; position: absolute; bottom: -2px; right: -2px; width: 6px; height: 6px; background: #2196F3; border-radius: 50%; }
		.msg-reaction-icon span { display: flex; align-items: center; justify-content: center; }
	`;
	document.head.appendChild(style);

	const init = () => {
		observer.observe(document.body, {childList: true, subtree: true});
		initReactions();
	};
	"loading" === document.readyState ? document.addEventListener("DOMContentLoaded", init) : init();
})();
