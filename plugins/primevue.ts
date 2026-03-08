import type { App } from "vue";
import PrimeVue from "primevue/config";
import Aura from "@primevue/themes/aura";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import Textarea from "primevue/textarea";
import Select from "primevue/select";
import Tag from "primevue/tag";
import Toast from "primevue/toast";
import ToastService from "primevue/toastservice";
import Dialog from "primevue/dialog";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import ConfirmDialog from "primevue/confirmdialog";
import ConfirmationService from "primevue/confirmationservice";
import MultiSelect from "primevue/multiselect";
import Image from "primevue/image";
import ProgressSpinner from "primevue/progressspinner";

export function setupPrimeVue(app: App) {
  app.use(PrimeVue, {
    theme: {
      preset: Aura,
      options: {
        darkModeSelector: ".dark",
      },
    },
  });

  app.use(ToastService);
  app.use(ConfirmationService);

  app.component("Button", Button);
  app.component("InputText", InputText);
  app.component("Textarea", Textarea);
  app.component("Select", Select);
  app.component("Tag", Tag);
  app.component("Toast", Toast);
  app.component("Dialog", Dialog);
  app.component("DataTable", DataTable);
  app.component("Column", Column);
  app.component("ConfirmDialog", ConfirmDialog);
  app.component("MultiSelect", MultiSelect);
  app.component("Image", Image);
  app.component("ProgressSpinner", ProgressSpinner);
}
