import { html } from '../README.md'

const main = document.getElementById('main')
main!.innerHTML = html.replace(
	/https:\/\/github\.com\/airgap\/loda\/blob\/master/g,
	''
)
