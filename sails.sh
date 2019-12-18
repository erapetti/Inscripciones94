#!/bin/bash
#
#


cd `dirname $0`
export NODE_ENV=production
exec node node_modules/sails/bin/sails.js lift --prod $*
#exec node node_modules/sails/bin/sails.js lift $*
