# Attribution & Provenance

This project combines work from several sources under their respective licenses.

## Validation tool code — MIT

The application originated as **[Loamist/boost-schema-validator](https://github.com/Loamist/boost-schema-validator)**, created by Loamist and released under the MIT License. This repository is a fork, maintained by the BOOST Working Group, that continues development of the validator into production traceability infrastructure.

The original MIT copyright and permission notice are retained in [LICENSE](LICENSE). New contributions in this fork are likewise MIT-licensed.

## BOOST schemas — W3C Software and Document License

The contents of the `schema/` directory are copied from the **[BOOST standard](https://github.com/BOOST-Working-Group/BOOST)** (Biomass Open Origin Standard for Tracking), pinned to a published release tag. BOOST schemas and examples are licensed under the [W3C Software and Document License](https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document) and are © the BOOST Working Group contributors.

These files are vendored, not authored here. To update them, re-run `npm run fetch-schema` against a chosen release tag rather than editing them in place.

## Funding

Continued development of the validation infrastructure in this fork — including file upload, a server-side validation API, and regulatory sufficiency checks — is supported by the **California Board of Forestry and Fire Protection Joint Institute** grant for BOOST Phase 2.
