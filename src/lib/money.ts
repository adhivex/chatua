export const formatINR = (rupees: number) =>
  "₹" + new Intl.NumberFormat("en-IN").format(rupees);
