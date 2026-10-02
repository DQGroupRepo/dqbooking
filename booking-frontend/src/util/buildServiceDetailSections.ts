import type { ServiceAttribute } from "../types/ServiceAttribute";

import type { ServiceDetailSection } from "../types/ServiceDetailSection";

import type { VendorServiceForm } from "../types/VendorServiceForm";

import { SERVICE_DETAIL_SECTION_CONFIG } from "../config/serviceDetailSectionConfig";

export default function buildServiceDetailSections(
  formData: VendorServiceForm,
): ServiceDetailSection[] {
  const category = formData.category?.toUpperCase().trim();

  const sectionConfigs = SERVICE_DETAIL_SECTION_CONFIG[category] ?? [];

  return sectionConfigs

    .map((section) => {
      const attributes: ServiceAttribute[] = section.attributes

        .map((attribute) => {
          const value = formData[attribute.field as keyof VendorServiceForm];

          /*
           * Ignore undefined,
           * null and empty strings.
           */
          if (value === undefined || value === null || value === "") {
            return null;
          }

          return {
            key: attribute.key,

            value: String(value),
          };
        })

        .filter(
          (attribute): attribute is ServiceAttribute => attribute !== null,
        );

      /*
       * Do not send empty sections.
       */
      if (attributes.length === 0) {
        return null;
      }

      return {
        key: section.key,

        title: section.title,

        attributes,
      };
    })

    .filter((section): section is ServiceDetailSection => section !== null);
}
