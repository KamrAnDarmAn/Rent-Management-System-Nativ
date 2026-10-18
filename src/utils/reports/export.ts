import { Platform, Share } from "react-native";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";

export async function exportReport(
  csv: string,
  filename: string,
  title: string,
) {
  if (Platform.OS === "web") {
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } else if (await Sharing.isAvailableAsync()) {
    const file = new File(Paths.cache, filename);
    file.create({ overwrite: true });
    file.write(csv);
    await Sharing.shareAsync(file.uri, {
      mimeType: "text/csv",
      UTI: "public.comma-separated-values-text",
      dialogTitle: title,
    });
  } else await Share.share({ title, message: csv });
}
