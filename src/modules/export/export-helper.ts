import { Interact } from "../../store/interact";
import { Lang } from "../../store/lang";
import { UserStore } from "../../store/user-store";
import Exporter from "./export";

export default async function exportData() {
  const Export = new Exporter();
  let confirmed = await Interact.confirm(
    `${Lang.t("settings.export-title", "Generate a Backup")}`,
    `${Lang.t("settings.export-confirm", "Depending on how long much data you have, this might take a while.")}`
  );

  if (confirmed === true) {
    Export.onChange((change) => {
      Interact.toast(`Export: ${change}`, { perm: true });
    });
    Export.start().then(() => {
      Interact.toast(Lang.t("settings.export-complete", "Export Complete"));
      UserStore.saveLastBackupDate();
    });
  }
}
