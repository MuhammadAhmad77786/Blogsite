import { stripTags } from "./sanitize";

export function categoryPayload(data) {
  return {
    name: stripTags(data.name),
    description: stripTags(data.description),
    icon: data.icon,
    image: { url: data.image.url, publicId: stripTags(data.image.publicId), alt: stripTags(data.image.alt) },
    parentCategory: data.parentCategory || null,
    order: data.order,
    adNetwork: data.adNetwork,
    showInFooter: data.showInFooter,
    showInNavbar: data.showInNavbar,
    seo: { title: stripTags(data.seo.title), metaDescription: stripTags(data.seo.metaDescription) },
  };
}
