import { bootDemoSite, setupHashRouter } from "../shared/boot";

bootDemoSite("coral-demo");
setupHashRouter();
if (!window.location.hash) {
  window.location.hash = "#/booking";
}
