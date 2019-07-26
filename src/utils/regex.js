export default {
	tag_v311: /(#[^\s|\.|#|\?)][\x00-\xFF][^\s]+)/,
	tag: /(#[\x00-\xFF][^\s]+)/ //new as of 3.1.3
}