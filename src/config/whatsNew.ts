import latest from "./whatsNew.json";

export default {
  version: import.meta.env.PACKAGE_VERSION,
  features: latest.features,
  fixes: latest.fixes,
  chores: latest.chores,
};
