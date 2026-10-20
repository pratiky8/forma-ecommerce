//#region node_modules/.nitro/vite/services/ssr/assets/format-DNjISxKy.js
var inr = new Intl.NumberFormat("en-IN", {
	style: "currency",
	currency: "INR",
	maximumFractionDigits: 2,
	minimumFractionDigits: 0
});
function formatINR(value) {
	return inr.format(value);
}
function formatDate(iso) {
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return iso;
	return new Intl.DateTimeFormat("en-IN", {
		day: "numeric",
		month: "short",
		year: "numeric"
	}).format(d);
}
var ORDER_STATUS_LABEL = {
	pending: "Pending",
	awaiting_payment: "Awaiting payment",
	paid: "Paid",
	processing: "Processing",
	shipped: "Shipped",
	delivered: "Delivered",
	cancelled: "Cancelled",
	refunded: "Refunded"
};
//#endregion
export { formatDate as n, formatINR as r, ORDER_STATUS_LABEL as t };
