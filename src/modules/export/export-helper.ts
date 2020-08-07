import { Interact } from "../../store/interact";
import { Lang } from "../../store/lang";
import { UserStore } from "../../store/user-store";
import Exporter from "./export";

export default async function exportData() {
  const Export = new Exporter();
  let confirmed = await Interact.confirm("Download a backup?", Lang.t("settings.export-confirm"));

  if (confirmed === true) {
    Export.onChange((change) => {
      Interact.toast(`Export: ${change}`, { perm: true });
    });
    Export.start().then(() => {
      Interact.toast(Lang.t("settings.export-complete"));
      UserStore.saveLastBackupDate();
    });
  }
}
