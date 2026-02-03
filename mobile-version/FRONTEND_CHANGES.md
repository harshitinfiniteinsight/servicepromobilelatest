# Mobile Version – Frontend Changes Summary (since Fri, Jan 23, 2026)

This document lists UI/UX updates in the mobile app that landed after Fri, Jan 23, 2026. It is written for frontend developers; no backend changes were involved.

## Service Pictures Modal
- Title renamed to "Upload Service Pictures" for clarity.
- Vertical spacing tightened so image grids sit higher on mobile:
  - Reduced overall dialog padding.
  - Reduced header/footer padding.
  - Reduced gaps between header and first section, and between section labels and their content.
  - More compact image grid and dropzone spacing while keeping touch targets usable.
- Behavior unchanged: before/after sections and multi-image upload remain.

## Job Card Overflow Menu
- Menu item label changed from "Add Pictures" to "Upload Pictures" across all job statuses (Scheduled, In Progress, Completed).
- Icons, routing, and handlers unchanged.

## Job Title Display
- Jobs created from documents that showed IDs like "Invoice INV-040" now display a human-friendly job title (with fallback when no service name is available).

## General Notes
- No touch targets were reduced below mobile-friendly sizes.
- No backend or data model changes were made for these UI updates.
- Dev server remains at http://localhost:8081/ for local testing.
