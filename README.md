<img src="https://github.com/airgap/loda/blob/master/res/img/header.svg">

## What It Is
An open-source JavaScript library that reduces page load times by up to 90%. Seriously. 90%.

## What It Isn't
Bulky and complex. Loda is currently under 3KB gzipped and requires zero setup.

# Features

## Rapid Machine Learning [NEW]
We utilize a proprietary Rapid Machine Learning algorithm to learn visitors' browsing habits in realtime. No typewriting monkeys or wheel-running hamsters to train, just instant speed improvements for everybody browsing your site. Loda's RML is completely automated Machine Learning as a Service (MLaaS) and as such requires no interaction from you to work. Once you enable machine learning on your site, Loda automatically sends relevant data to our neural net for processing, and enhancements are pushed live to visitors on your site.

That being said, Loda can function without access to a machine learning server. **Unless you specifically tell the script to connect to the central Loda server, it will run in headless mode** and use the other optimization methods without issue.

## Click Anticipation
Normally, visitors clicking on a link on your website will fetch the linked page from your server (which has to read and parse it before sending it) before displaying it in their browser window. Loda overrides web browsers' default page loaders and fetches and the target page before the visitor clicks the link... or even hovers over it. Then, when the visitor actually clicks the link, the page loads instantly and without a server fetch.

## Page Cache
Every preloaded page is cached into memory so it only has to be fetched once. As a visitor navigates your site, the cache is rapidly built, so they never have to fetch the same page twice. The cache is automatically updated if your site-version is higher than the cache's. Loda utilizes RML to auto-cache pages commonly navigated to from specific pages, and does so unobtrusively in the background (WIP).

## Perfect Failover
Reliability is always the #1 priority, so we've designed Loda to fail as elegantly as possible. If the RML server goes down, the client-side Loda script can run headless, performing click anticipation, page caching, and CSS acceleration with no issue. Even if the Loda client-side script somehow fails, your website will function normally, just without the boosts Loda provides. This is possible because Loda requires no special DOM modifications to run -- it works with standard anchor tags and only applies optimizations to them upon page load.

## Copy+Paste Implementation
Copy and Paste implementation Loda may be a complex piece of digital equipment, but it's designed from the ground up for ease of use. All you have to do to benefit from Loda's many features is copy+paste a single line of code into your pages' <head> tag. That's it. Everything else is automatic.

## Event Anticipation
Possibly the zaniest feature Loda provides is the ability to trigger hover events before the cursor actually mouses over an element. Using the same [movement-prediction algorithm](https://github.com/airgap/ftl) powering the click anticipation and autocaching, Loda tracks cursor movement and accurately predicts when an element is about to be hovered over, adding the .prehover class and triggering the prehover event before the cursor even touches the element.

## So Crazy It Works
We're proud to say Loda is probably the craziest JavaScript library ever invented. We load pages before they're needed, trigger events before they occur, and pack Rapid Machine Learning into a single `<script>` reference. No, this isn't some April Fools joke, this is the real deal. Sometimes crazy is a good thing.

# Setup

Loda is available minified in both [ES5](loda.es5.min.js) and [ES6](loda.es6.min.js)</a> variants. The [ES6](loda.es6.min.js) version is incompatible with some older browsers (e.g. IE) but is slightly smaller than the [ES5](loda.es5.min.js) version.

Additionally, you can download the source [TypeScript](loda.ts) as well as the unminified [JavaScript](loda.js). If you want to debug the minified JavaScript more easily, we recommend downloading one of the minification maps linked below.

So, to recap:

File | Description
---- | ----
[Minified ES5](loda.es5.min.js) | You probably want this one
[Minified ES6](loda.es6.min.js) | Smaller but less compatible
[Unminified JavaScript](loda.js) | If you want to edit it
[Source TypeScript](loda.ts) | If you enjoy lengthy compilation times
[Minified ES5 Map](loda.es5.min.js.map) | For ES5 debugging
[Minified ES6 Map](loda.es6.min.js.map) | Same but ES6
