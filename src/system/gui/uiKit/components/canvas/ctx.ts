import { UiKitCanvasElement } from "./canvas";

export function proxyContext(
	canvas: UiKitCanvasElement,
	ctx: RenderingContext
) {
	console.trace(ctx);
	if (ctx == null) return null;

	const handler: ProxyHandler<RenderingContext> = {
		get(target, prop, receiver) {
			if (prop === "canvas") {
				return canvas;
			}

			const val = Reflect.get(target, prop);

			if (typeof val == "function") {
				return val.bind(target);
			} else {
				return val;
			}
		}
	};

	const proxy = new Proxy(ctx, handler);

	return proxy;
}
