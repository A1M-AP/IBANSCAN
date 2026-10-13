# AdSense display advertising

The site has separated, labelled ad inventory below content. Without configuration nothing is displayed and no advertising request is made.

After Google approves the site, create responsive display units in AdSense. Configure the PUBLIC variables in .env.example: publisher ca-pub-… and slot IDs. Publish Google's certified European regulations message in AdSense Privacy & messaging, then set NEXT_PUBLIC_GOOGLE_CMP_URL to the exact fundingchoicesmessages.google.com script URL Google provides. Configure these at build time for Cloudflare and rebuild.

The component waits for the CMP's TCF callback. Ads load only after affirmative purpose 1, 3, 4 and Google vendor 755 consent. Missing CMP, missing consent and invalid IDs fail closed. Turning off or revoking consent removes the unit; use the certified CMP's own persistent privacy-settings control for changing consent. Include that control in the message configuration. Consent is not approximated with a custom accept button. The deployment operator must publish the actual operator details and privacy notice before activation.

The CSP opens Google ad/CMP origins only when publisher and CMP configuration are present. ads.txt is generated from the configured publisher. No auto-ads are injected. Test actual approved ad rendering and consent withdrawal on the production domain; configured placements do not imply AdSense approval or revenue.

Official setup: https://support.google.com/adsense/answer/13554116 and https://support.google.com/adsense/answer/9183363.
