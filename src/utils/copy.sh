#!/bin/sh
cd /Documents/blog/logs
cp access.log $(date +%Y-%m-%d).access.log
echo "" > access.log