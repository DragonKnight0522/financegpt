import React, { useState, useEffect } from "react";

const TypeWriter = ({ children, typingFinished, setIsTyping }) => {
	const [text, setText] = useState("");
	let timer;

	useEffect(() => {
		const tick = () => {
			timer = setInterval(() => {
				setText((text) => {
					const nextText = children.substring(0, text.length + 1);
					if (nextText === children) {
						clearInterval(timer);
						if (typeof typingFinished === "function") {
							typingFinished();
						}
					}
					return nextText;
				});
			}, 10);
		};

		if (children.length > 0) {
			tick();
		}

		// Now timer is available in the cleanup function:
		return () => clearInterval(timer);
	}, [children]);

	return (
		<>
			{text.split("\n").map((item, key) => {
				return (
					<span key={key}>
						{item}
						<br />
					</span>
				);
			})}
		</>
	);
};

export default TypeWriter;
