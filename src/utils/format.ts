export const money = (value: number | bigint) =>
  `AFN ${(typeof value === "bigint" ? value : Math.round(value)).toLocaleString("en-US")}`;

export const number = (value: number) =>
  Math.round(value).toLocaleString("en-US");
