function usage() {
  echo -e "Usage: $0 [--deploy,--delete]"
}

function deploy(){
    delete

    ibmcloud fn trigger create trigger-emas --feed /whisk.system/alarms/alarm --param cron '* 4 * * *'
    ibmcloud fn rule create rule-trigger-emas trigger-emas bot-finansial/sequenceEmas

    # ibmcloud fn trigger create trigger-emas-dev --feed /whisk.system/alarms/alarm --param cron '*/17 * * * *'
    # ibmcloud fn rule create rule-trigger-emas-dev trigger-emas-dev bot-finansial/sequenceEmasDev

    ibmcloud fn trigger create trigger-bitcoin --feed /whisk.system/alarms/alarm --param cron '1 0 * * *'
    ibmcloud fn rule create rule-trigger-bitcoin trigger-bitcoin bot-finansial/sequenceBitcoin

    # ibmcloud fn trigger create trigger-bitcoin-dev --feed /whisk.system/alarms/alarm --param cron '*/11 * * * *'
    # ibmcloud fn rule create rule-trigger-bitcoin-dev trigger-bitcoin-dev bot-finansial/sequenceBitcoinDev

    ibmcloud fn trigger create trigger-idx --feed /whisk.system/alarms/alarm --param cron '10 0 * * *'
    ibmcloud fn rule create rule-trigger-idx trigger-idx bot-finansial/sequenceIdx

    ibmcloud fn trigger create trigger-idx-dev --feed /whisk.system/alarms/alarm --param cron '*/15 * * * *'
    ibmcloud fn rule create rule-trigger-idx-dev trigger-idx-dev bot-finansial/sequenceIdxDev
}

function delete() {
  # trigger emas
  ibmcloud fn rule delete rule-trigger-emas
  ibmcloud fn trigger delete trigger-emas

  ibmcloud fn rule delete rule-trigger-emas-dev
  ibmcloud fn trigger delete trigger-emas-dev

  # trigger bitcoin
  ibmcloud fn rule delete rule-trigger-bitcoin
  ibmcloud fn trigger delete trigger-bitcoin

  ibmcloud fn rule delete rule-trigger-bitcoin-dev
  ibmcloud fn trigger delete trigger-bitcoin-dev

  # trigger idx
  ibmcloud fn rule delete rule-trigger-idx
  ibmcloud fn trigger delete trigger-idx

  ibmcloud fn rule delete rule-trigger-idx-dev
  ibmcloud fn trigger delete trigger-idx-dev
}

case "$1" in
"--deploy" )
deploy
;;
"--delete" )
delete
;;
* )
usage
;;
esac