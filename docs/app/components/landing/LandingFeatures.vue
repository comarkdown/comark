<script setup lang="ts">
defineProps<{
  streamingHeadline: string
  streamingTitle: string
  streamingDescription: string
  streamingLinkLabel: string
  streamingLinkTo: string
  frameworksHeadline: string
  frameworksTitle: string
  frameworksDescription: string
  frameworksVueLinkLabel: string
  frameworksVueLinkTo: string
  frameworksReactLinkLabel: string
  frameworksReactLinkTo: string
}>()
</script>

<template>
  <div class="grid border-b border-default lg:grid-cols-2">
    <LandingFeatureStreaming
      :headline="streamingHeadline"
      :title="streamingTitle"
      :description="streamingDescription"
      :link-label="streamingLinkLabel"
      :link-to="streamingLinkTo"
      class="min-w-0 lg:border-r lg:border-default"
    />
    <LandingFeatureFrameworks
      :headline="frameworksHeadline"
      :title="frameworksTitle"
      :description="frameworksDescription"
      :vue-link-label="frameworksVueLinkLabel"
      :vue-link-to="frameworksVueLinkTo"
      :react-link-label="frameworksReactLinkLabel"
      :react-link-to="frameworksReactLinkTo"
      class="min-w-0"
    />
  </div>
</template>
