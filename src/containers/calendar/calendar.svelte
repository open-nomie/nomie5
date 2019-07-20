<script>
    // ventders 
    import dayjs from 'dayjs';

    const data = {
        firstDay: (new Date(year, month)).getDay(),
        
    }

    const methods = {
        daysInMonth(iMonth, iYear) 
        { 
            return 32 — (new Date(iYear, iMonth, 32).getDate());
        }
    }

</script>

<style lang="scss" type="text/scss">
    .n-calendar {

    }
</style>

<div class="n-calendar">

</div>