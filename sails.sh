#!/bin/bash
#
#


cd `dirname $0`

if [ `hostname` = "ubuntu" ]
then
	exec node node_modules/sails/bin/sails.js lift $*
	exit 0
fi

export NODE_ENV=production
exec node node_modules/sails/bin/sails.js lift --prod $*
