exports.getTimeZone=function(offset) {
    d = new Date();
	utc = d.getTime() + (d.getTimezoneOffset() * 60000);
	nd = new Date(utc + (3600000*offset));
	return nd;
}