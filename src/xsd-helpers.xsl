<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:xd="http://www.oxygenxml.com/ns/doc/xsl"
    xmlns:xs="http://www.w3.org/2001/XMLSchema"
    xmlns:xsdh="http://saxonica.com/ns/xsd-helpers"
    exclude-result-prefixes="xs xd xsdh"
    version="3.0">

    <xd:doc scope="component">
        <xd:desc>
            <xd:p>Normalize datatype names from xsd:/xs:/xforms: prefixes into canonical local names.</xd:p>
            <xd:p>Special-cases custom ccnumber handling used by 2.3.a.</xd:p>
        </xd:desc>
        <xd:param name="binding-type">Datatype string from bind metadata</xd:param>
    </xd:doc>
    <xsl:function name="xsdh:canonical-type" as="xs:string">
        <xsl:param name="binding-type" as="xs:string?"/>
        <xsl:variable name="raw" as="xs:string" select="lower-case(normalize-space(string($binding-type)))"/>
        <xsl:variable name="normalized-prefix" as="xs:string" select="
            if (starts-with($raw,'xsd:') or starts-with($raw,'xs:') or starts-with($raw,'xforms:'))
            then substring-after($raw,':')
            else $raw"/>
        <xsl:sequence select="
            if ($normalized-prefix = '')
            then ''
            else if ($raw = ('my:ccnumber','ccnumber'))
            then 'ccnumber-strict'
            else if ($raw = ('xforms:card-number','card-number'))
            then 'card-number'
            else $normalized-prefix"/>
    </xsl:function>

    <xd:doc scope="component">
        <xd:desc>
            <xd:p>Return true when a value is valid for a given datatype.</xd:p>
            <xd:p>Empty values are accepted by default so @required remains the source of presence checks, except for explicit nonEmptyString handling.</xd:p>
        </xd:desc>
        <xd:param name="binding-type">Datatype string from bind metadata</xd:param>
        <xd:param name="raw-value">Current lexical value to validate</xd:param>
    </xd:doc>
    <xsl:function name="xsdh:is-type-valid" as="xs:boolean">
        <xsl:param name="binding-type" as="xs:string?"/>
        <xsl:param name="raw-value" as="xs:string?"/>
        <xsl:variable name="raw-type" as="xs:string" select="lower-case(normalize-space(string($binding-type)))"/>
        <xsl:variable name="is-xforms-type" as="xs:boolean" select="starts-with($raw-type,'xforms:')"/>
        <xsl:variable name="type" as="xs:string" select="xsdh:canonical-type($binding-type)"/>
        <xsl:variable name="value" as="xs:string" select="normalize-space(string($raw-value))"/>
        <xsl:sequence select="
            if ($type = '')
            then true()
            else if ($type = 'nonemptystring')
            then string-length($value) gt 0
            else if ($value = '' and $is-xforms-type)
            then true()
            else if ($type = 'datetime')
            then ($value castable as xs:dateTime)
            else if ($type = 'time')
            then ($value castable as xs:time)
            else if ($type = 'date')
            then ($value castable as xs:date)
            else if ($type = 'gyearmonth')
            then ($value castable as xs:gYearMonth)
            else if ($type = 'gyear')
            then ($value castable as xs:gYear)
            else if ($type = 'gmonthday')
            then ($value castable as xs:gMonthDay)
            else if ($type = 'gday')
            then ($value castable as xs:gDay)
            else if ($type = 'gmonth')
            then ($value castable as xs:gMonth)
            else if ($type = ('string','normalizedstring','token'))
            then true()
            else if ($type = 'language')
            then ($value castable as xs:language)
            else if ($type = 'name')
            then ($value castable as xs:Name)
            else if ($type = 'ncname')
            then ($value castable as xs:NCName)
            else if ($type = 'id')
            then ($value castable as xs:ID)
            else if ($type = 'idref')
            then ($value castable as xs:IDREF)
            else if ($type = 'idrefs')
            then ($value castable as xs:IDREFS)
            else if ($type = 'nmtoken')
            then ($value castable as xs:NMTOKEN)
            else if ($type = 'nmtokens')
            then ($value castable as xs:NMTOKENS)
            else if ($type = 'boolean')
            then ($value castable as xs:boolean)
            else if ($type = 'base64binary')
            then ($value castable as xs:base64Binary)
            else if ($type = 'hexbinary')
            then ($value castable as xs:hexBinary)
            else if ($type = 'float')
            then ($value castable as xs:float)
            else if ($type = 'decimal')
            then ($value castable as xs:decimal)
            else if ($type = 'double')
            then ($value castable as xs:double)
            else if ($type = 'anyuri')
            then (not(matches($value,'\s')) and ($value castable as xs:anyURI))
            else if ($type = 'qname')
            then matches($value,'^[A-Za-z_][A-Za-z0-9._-]*(:[A-Za-z_][A-Za-z0-9._-]*)?$')
            else if ($type = 'integer')
            then ($value castable as xs:integer)
            else if ($type = 'nonpositiveinteger')
            then ($value castable as xs:nonPositiveInteger)
            else if ($type = 'negativeinteger')
            then ($value castable as xs:negativeInteger)
            else if ($type = 'long')
            then ($value castable as xs:long)
            else if ($type = 'int')
            then ($value castable as xs:int)
            else if ($type = 'short')
            then ($value castable as xs:short)
            else if ($type = 'byte')
            then ($value castable as xs:byte)
            else if ($type = 'nonnegativeinteger')
            then ($value castable as xs:nonNegativeInteger)
            else if ($type = 'unsignedlong')
            then ($value castable as xs:unsignedLong)
            else if ($type = 'unsignedint')
            then ($value castable as xs:unsignedInt)
            else if ($type = 'unsignedshort')
            then ($value castable as xs:unsignedShort)
            else if ($type = 'unsignedbyte')
            then ($value castable as xs:unsignedByte)
            else if ($type = 'positiveinteger')
            then ($value castable as xs:positiveInteger)
            else if ($type = 'listitem')
            then not(matches($value,'\s'))
            else if ($type = 'listitems')
            then matches($value,'^\S+(\s+\S+)*$')
            else if ($type = 'daytimeduration')
            then ($value castable as xs:dayTimeDuration)
            else if ($type = 'yearmonthduration')
            then ($value castable as xs:yearMonthDuration)
            else if ($type = 'email')
            then matches($value,'^[^\s@]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
            else if ($type = 'card-number')
            then matches($value,'^\d{12,19}$')
            else if ($type = 'ccnumber-strict')
            then matches($value,'^\d{14,18}$')
            else true()"/>
    </xsl:function>


    <xd:doc scope="component">
        <xd:desc>
            <xd:p>Validate a lexical value against a schema-derived restricted simpleType.</xd:p>
            <xd:p>This supports scoped XSD facet checks used by the NIST facet harness for Saxon-Forms.</xd:p>
        </xd:desc>
        <xd:param name="binding-type">Named simpleType from bind metadata or schema element @type</xd:param>
        <xd:param name="raw-value">Current lexical value to validate</xd:param>
        <xd:param name="schema-doc">Schema document containing simpleType restrictions</xd:param>
    </xd:doc>
    <xsl:function name="xsdh:is-type-valid-against-schema" as="xs:boolean">
        <xsl:param name="binding-type" as="xs:string?"/>
        <xsl:param name="raw-value" as="xs:string?"/>
        <xsl:param name="schema-doc" as="document-node()?"/>
        <xsl:variable name="type-name" as="xs:string" select="normalize-space(string($binding-type))"/>
        <xsl:variable name="type-local" as="xs:string" select="xsdh:local-type-name($type-name)"/>
        <xsl:variable name="restrictions" as="element(xs:restriction)*" select="xsdh:restriction-chain($schema-doc,$type-local,())"/>
        <xsl:variable name="base-type" as="xs:string" select="xsdh:resolved-base-type($schema-doc,$type-local,())"/>
        <!-- TEST-TRACE: apply whiteSpace facet normalization before facet checks; helps scripts/run-nist-facet-harness.mjs whiteSpace groups. -->
        <xsl:variable name="normalized-value" as="xs:string" select="xsdh:apply-white-space(string($raw-value),$restrictions)"/>
        <xsl:sequence select="
            if ($type-name = '' or empty($schema-doc))
            then xsdh:is-type-valid($type-name,$raw-value)
            else if (empty($restrictions))
            then xsdh:is-type-valid($type-name,$raw-value)
            else if (not(xsdh:is-type-valid($base-type,$normalized-value)))
            then false()
            else xsdh:facet-valid($normalized-value,$base-type,$restrictions)"/>
    </xsl:function>

    <xsl:function name="xsdh:facet-valid" as="xs:boolean">
        <xsl:param name="value" as="xs:string"/>
        <xsl:param name="base-type" as="xs:string"/>
        <xsl:param name="restrictions" as="element(xs:restriction)*"/>
        <xsl:variable name="length-facets" as="xs:integer*" select="$restrictions/xs:length/@value ! xs:integer(.)"/>
        <xsl:variable name="min-length-facets" as="xs:integer*" select="$restrictions/xs:minLength/@value ! xs:integer(.)"/>
        <xsl:variable name="max-length-facets" as="xs:integer*" select="$restrictions/xs:maxLength/@value ! xs:integer(.)"/>
        <xsl:variable name="pattern-facets" as="xs:string*" select="$restrictions/xs:pattern/@value ! string(.)"/>
        <xsl:variable name="enum-facets" as="xs:string*" select="$restrictions/xs:enumeration/@value ! string(.)"/>
        <xsl:variable name="min-inclusive-facets" as="xs:string*" select="$restrictions/xs:minInclusive/@value ! string(.)"/>
        <xsl:variable name="max-inclusive-facets" as="xs:string*" select="$restrictions/xs:maxInclusive/@value ! string(.)"/>
        <xsl:variable name="min-exclusive-facets" as="xs:string*" select="$restrictions/xs:minExclusive/@value ! string(.)"/>
        <xsl:variable name="max-exclusive-facets" as="xs:string*" select="$restrictions/xs:maxExclusive/@value ! string(.)"/>
        <xsl:variable name="total-digits-facets" as="xs:integer*" select="$restrictions/xs:totalDigits/@value ! xs:integer(.)"/>
        <xsl:variable name="fraction-digits-facets" as="xs:integer*" select="$restrictions/xs:fractionDigits/@value ! xs:integer(.)"/>
        <!-- TEST-TRACE: use type-aware facet length semantics (not raw lexical length) for binary families; helps scripts/run-nist-facet-harness.mjs base64Binary length groups. -->
        <xsl:variable name="length" as="xs:integer?" select="xsdh:facet-length($value,$base-type)"/>
        <!-- TEST-TRACE: support totalDigits/fractionDigits for decimal-derived types; helps scripts/run-nist-facet-harness.mjs decimal digit groups. -->
        <xsl:variable name="decimal-lex" as="xs:string?" select="
            if (xsdh:is-decimal-family($base-type) and ($value castable as xs:decimal))
            then string(xs:decimal($value))
            else ()"/>
        <xsl:variable name="decimal-total-digits" as="xs:integer?" select="
            if (exists($decimal-lex))
            then string-length(replace($decimal-lex,'[^0-9]',''))
            else ()"/>
        <xsl:variable name="decimal-fraction-digits" as="xs:integer?" select="
            if (exists($decimal-lex))
            then (if (contains($decimal-lex,'.')) then string-length(substring-after($decimal-lex,'.')) else 0)
            else ()"/>
        <xsl:sequence select="
            (
                if (exists($length-facets))
                then exists($length) and (every $l in $length-facets satisfies $length = $l)
                else true()
            )
            and (
                if (exists($min-length-facets))
                then exists($length) and (every $l in $min-length-facets satisfies $length ge $l)
                else true()
            )
            and (
                if (exists($max-length-facets))
                then exists($length) and (every $l in $max-length-facets satisfies $length le $l)
                else true()
            )
            and (every $p in $pattern-facets satisfies matches($value,$p))
            and (
                if (exists($enum-facets))
                then some $enum in $enum-facets satisfies xsdh:facet-value-eq($value,$enum,$base-type)
                else true()
            )
            and (every $bound in $min-inclusive-facets satisfies xsdh:facet-compare($value,$bound,$base-type,'ge'))
            and (every $bound in $max-inclusive-facets satisfies xsdh:facet-compare($value,$bound,$base-type,'le'))
            and (every $bound in $min-exclusive-facets satisfies xsdh:facet-compare($value,$bound,$base-type,'gt'))
            and (every $bound in $max-exclusive-facets satisfies xsdh:facet-compare($value,$bound,$base-type,'lt'))
            and (
                if (exists($total-digits-facets))
                then exists($decimal-total-digits) and (every $limit in $total-digits-facets satisfies $decimal-total-digits le $limit)
                else true()
            )
            and (
                if (exists($fraction-digits-facets))
                then exists($decimal-fraction-digits) and (every $limit in $fraction-digits-facets satisfies $decimal-fraction-digits le $limit)
                else true()
            )"/>
    </xsl:function>
    <xd:doc scope="component">
        <xd:desc>
            <xd:p>Return facet length using datatype-aware semantics where needed.</xd:p>
            <xd:p>Binary datatypes count octets; fallback remains lexical string-length.</xd:p>
        </xd:desc>
        <xd:param name="value">Facet candidate lexical value</xd:param>
        <xd:param name="base-type">Resolved base type lexical name</xd:param>
    </xd:doc>

    <xsl:function name="xsdh:facet-length" as="xs:integer?">
        <xsl:param name="value" as="xs:string"/>
        <xsl:param name="base-type" as="xs:string"/>
        <xsl:variable name="canonical" as="xs:string" select="xsdh:canonical-type($base-type)"/>
        <xsl:sequence select="
            if ($canonical = 'base64binary' and ($value castable as xs:base64Binary))
            then string-length(string(xs:hexBinary(xs:base64Binary($value)))) idiv 2
            else if ($canonical = 'hexbinary' and ($value castable as xs:hexBinary))
            then string-length(string(xs:hexBinary($value))) idiv 2
            else string-length($value)"/>
    </xsl:function>

    <xsl:function name="xsdh:facet-value-eq" as="xs:boolean">
        <xsl:param name="left" as="xs:string"/>
        <xsl:param name="right" as="xs:string"/>
        <xsl:param name="base-type" as="xs:string"/>
        <xsl:sequence select="
            if (xsdh:is-decimal-family($base-type) and ($left castable as xs:decimal) and ($right castable as xs:decimal))
            then xs:decimal($left) = xs:decimal($right)
            else if ($base-type = ('float','double') and ($left castable as xs:double) and ($right castable as xs:double))
            then xs:double($left) = xs:double($right)
            else $left = $right"/>
    </xsl:function>

    <xsl:function name="xsdh:facet-compare" as="xs:boolean">
        <xsl:param name="left" as="xs:string"/>
        <xsl:param name="right" as="xs:string"/>
        <xsl:param name="base-type" as="xs:string"/>
        <xsl:param name="op" as="xs:string"/>
        <!-- TEST-TRACE: add ordered facet comparisons for date/time families; helps scripts/run-nist-facet-harness.mjs date/dateTime/gDay boundary groups. -->
        <xsl:variable name="canonical" as="xs:string" select="xsdh:canonical-type($base-type)"/>
        <xsl:sequence select="
            if (xsdh:is-decimal-family($base-type) and ($left castable as xs:decimal) and ($right castable as xs:decimal))
            then (
                if ($op = 'ge') then xs:decimal($left) ge xs:decimal($right)
                else if ($op = 'le') then xs:decimal($left) le xs:decimal($right)
                else if ($op = 'gt') then xs:decimal($left) gt xs:decimal($right)
                else if ($op = 'lt') then xs:decimal($left) lt xs:decimal($right)
                else false()
            )
            else if ($canonical = ('float','double') and ($left castable as xs:double) and ($right castable as xs:double))
            then (
                if ($op = 'ge') then xs:double($left) ge xs:double($right)
                else if ($op = 'le') then xs:double($left) le xs:double($right)
                else if ($op = 'gt') then xs:double($left) gt xs:double($right)
                else if ($op = 'lt') then xs:double($left) lt xs:double($right)
                else false()
            )
            else if ($canonical = 'date' and ($left castable as xs:date) and ($right castable as xs:date))
            then (
                if ($op = 'ge') then xs:date($left) ge xs:date($right)
                else if ($op = 'le') then xs:date($left) le xs:date($right)
                else if ($op = 'gt') then xs:date($left) gt xs:date($right)
                else if ($op = 'lt') then xs:date($left) lt xs:date($right)
                else false()
            )
            else if ($canonical = 'datetime' and ($left castable as xs:dateTime) and ($right castable as xs:dateTime))
            then (
                if ($op = 'ge') then xs:dateTime($left) ge xs:dateTime($right)
                else if ($op = 'le') then xs:dateTime($left) le xs:dateTime($right)
                else if ($op = 'gt') then xs:dateTime($left) gt xs:dateTime($right)
                else if ($op = 'lt') then xs:dateTime($left) lt xs:dateTime($right)
                else false()
            )
            else if ($canonical = 'time' and ($left castable as xs:time) and ($right castable as xs:time))
            then (
                if ($op = 'ge') then xs:time($left) ge xs:time($right)
                else if ($op = 'le') then xs:time($left) le xs:time($right)
                else if ($op = 'gt') then xs:time($left) gt xs:time($right)
                else if ($op = 'lt') then xs:time($left) lt xs:time($right)
                else false()
            )
            else if ($canonical = 'gyearmonth' and ($left castable as xs:gYearMonth) and ($right castable as xs:gYearMonth))
            then (
                if ($op = 'ge') then xs:gYearMonth($left) ge xs:gYearMonth($right)
                else if ($op = 'le') then xs:gYearMonth($left) le xs:gYearMonth($right)
                else if ($op = 'gt') then xs:gYearMonth($left) gt xs:gYearMonth($right)
                else if ($op = 'lt') then xs:gYearMonth($left) lt xs:gYearMonth($right)
                else false()
            )
            else if ($canonical = 'gyear' and ($left castable as xs:gYear) and ($right castable as xs:gYear))
            then (
                if ($op = 'ge') then xs:gYear($left) ge xs:gYear($right)
                else if ($op = 'le') then xs:gYear($left) le xs:gYear($right)
                else if ($op = 'gt') then xs:gYear($left) gt xs:gYear($right)
                else if ($op = 'lt') then xs:gYear($left) lt xs:gYear($right)
                else false()
            )
            else if ($canonical = 'gmonthday' and ($left castable as xs:gMonthDay) and ($right castable as xs:gMonthDay))
            then xsdh:facet-compare-gmonthday($left,$right,$op)
            else if ($canonical = 'gday' and ($left castable as xs:gDay) and ($right castable as xs:gDay))
            then xsdh:facet-compare-gday($left,$right,$op)
            else if ($canonical = 'gmonth' and ($left castable as xs:gMonth) and ($right castable as xs:gMonth))
            then xsdh:facet-compare-gmonth($left,$right,$op)
            else if ($canonical = 'daytimeduration' and ($left castable as xs:dayTimeDuration) and ($right castable as xs:dayTimeDuration))
            then (
                if ($op = 'ge') then xs:dayTimeDuration($left) ge xs:dayTimeDuration($right)
                else if ($op = 'le') then xs:dayTimeDuration($left) le xs:dayTimeDuration($right)
                else if ($op = 'gt') then xs:dayTimeDuration($left) gt xs:dayTimeDuration($right)
                else if ($op = 'lt') then xs:dayTimeDuration($left) lt xs:dayTimeDuration($right)
                else false()
            )
            else if ($canonical = 'yearmonthduration' and ($left castable as xs:yearMonthDuration) and ($right castable as xs:yearMonthDuration))
            then (
                if ($op = 'ge') then xs:yearMonthDuration($left) ge xs:yearMonthDuration($right)
                else if ($op = 'le') then xs:yearMonthDuration($left) le xs:yearMonthDuration($right)
                else if ($op = 'gt') then xs:yearMonthDuration($left) gt xs:yearMonthDuration($right)
                else if ($op = 'lt') then xs:yearMonthDuration($left) lt xs:yearMonthDuration($right)
                else false()
            )
            else false()"/>
    </xsl:function>

    <xd:doc scope="component">
        <xd:desc>
            <xd:p>Compare gDay lexical values by day-of-month component.</xd:p>
        </xd:desc>
        <xd:param name="left">Left lexical gDay</xd:param>
        <xd:param name="right">Right lexical gDay</xd:param>
        <xd:param name="op">Comparison operation: ge/le/gt/lt</xd:param>
    </xd:doc>
    <xsl:function name="xsdh:facet-compare-gday" as="xs:boolean">
        <xsl:param name="left" as="xs:string"/>
        <xsl:param name="right" as="xs:string"/>
        <xsl:param name="op" as="xs:string"/>
        <!-- TEST-TRACE: compare gDay boundaries lexically by day component to avoid xs:gDay ordered-comparison runtime errors; helps scripts/run-nist-facet-harness.mjs atomic-gDay max/min groups. -->
        <xsl:variable name="left-day" as="xs:integer?" select="if (matches($left,'^---[0-9]{2}')) then xs:integer(substring($left,4,2)) else ()"/>
        <xsl:variable name="right-day" as="xs:integer?" select="if (matches($right,'^---[0-9]{2}')) then xs:integer(substring($right,4,2)) else ()"/>
        <xsl:sequence select="
            if (exists($left-day) and exists($right-day))
            then xsdh:facet-compare-integer($left-day,$right-day,$op)
            else false()"/>
    </xsl:function>

    <xd:doc scope="component">
        <xd:desc>
            <xd:p>Compare gMonth lexical values by month component.</xd:p>
        </xd:desc>
        <xd:param name="left">Left lexical gMonth</xd:param>
        <xd:param name="right">Right lexical gMonth</xd:param>
        <xd:param name="op">Comparison operation: ge/le/gt/lt</xd:param>
    </xd:doc>
    <xsl:function name="xsdh:facet-compare-gmonth" as="xs:boolean">
        <xsl:param name="left" as="xs:string"/>
        <xsl:param name="right" as="xs:string"/>
        <xsl:param name="op" as="xs:string"/>
        <xsl:variable name="left-month" as="xs:integer?" select="if (matches($left,'^--[0-9]{2}')) then xs:integer(substring($left,3,2)) else ()"/>
        <xsl:variable name="right-month" as="xs:integer?" select="if (matches($right,'^--[0-9]{2}')) then xs:integer(substring($right,3,2)) else ()"/>
        <xsl:sequence select="
            if (exists($left-month) and exists($right-month))
            then xsdh:facet-compare-integer($left-month,$right-month,$op)
            else false()"/>
    </xsl:function>

    <xd:doc scope="component">
        <xd:desc>
            <xd:p>Compare gMonthDay lexical values by (month,day) tuple.</xd:p>
        </xd:desc>
        <xd:param name="left">Left lexical gMonthDay</xd:param>
        <xd:param name="right">Right lexical gMonthDay</xd:param>
        <xd:param name="op">Comparison operation: ge/le/gt/lt</xd:param>
    </xd:doc>
    <xsl:function name="xsdh:facet-compare-gmonthday" as="xs:boolean">
        <xsl:param name="left" as="xs:string"/>
        <xsl:param name="right" as="xs:string"/>
        <xsl:param name="op" as="xs:string"/>
        <xsl:variable name="left-month" as="xs:integer?" select="if (matches($left,'^--[0-9]{2}-[0-9]{2}')) then xs:integer(substring($left,3,2)) else ()"/>
        <xsl:variable name="left-day" as="xs:integer?" select="if (matches($left,'^--[0-9]{2}-[0-9]{2}')) then xs:integer(substring($left,6,2)) else ()"/>
        <xsl:variable name="right-month" as="xs:integer?" select="if (matches($right,'^--[0-9]{2}-[0-9]{2}')) then xs:integer(substring($right,3,2)) else ()"/>
        <xsl:variable name="right-day" as="xs:integer?" select="if (matches($right,'^--[0-9]{2}-[0-9]{2}')) then xs:integer(substring($right,6,2)) else ()"/>
        <xsl:variable name="left-key" as="xs:integer?" select="if (exists($left-month) and exists($left-day)) then ($left-month * 100 + $left-day) else ()"/>
        <xsl:variable name="right-key" as="xs:integer?" select="if (exists($right-month) and exists($right-day)) then ($right-month * 100 + $right-day) else ()"/>
        <xsl:sequence select="
            if (exists($left-key) and exists($right-key))
            then xsdh:facet-compare-integer($left-key,$right-key,$op)
            else false()"/>
    </xsl:function>

    <xsl:function name="xsdh:facet-compare-integer" as="xs:boolean">
        <xsl:param name="left" as="xs:integer"/>
        <xsl:param name="right" as="xs:integer"/>
        <xsl:param name="op" as="xs:string"/>
        <xsl:sequence select="
            if ($op = 'ge') then $left ge $right
            else if ($op = 'le') then $left le $right
            else if ($op = 'gt') then $left gt $right
            else if ($op = 'lt') then $left lt $right
            else false()"/>
    </xsl:function>

    <xsl:function name="xsdh:is-decimal-family" as="xs:boolean">
        <xsl:param name="base-type" as="xs:string"/>
        <xsl:variable name="canonical" as="xs:string" select="xsdh:canonical-type($base-type)"/>
        <xsl:sequence select="$canonical = (
            'decimal','integer','nonpositiveinteger','negativeinteger',
            'long','int','short','byte','nonnegativeinteger',
            'unsignedlong','unsignedint','unsignedshort','unsignedbyte','positiveinteger'
        )"/>
    </xsl:function>

    <xsl:function name="xsdh:apply-white-space" as="xs:string">
        <xsl:param name="value" as="xs:string"/>
        <xsl:param name="restrictions" as="element(xs:restriction)*"/>
        <xsl:variable name="mode" as="xs:string?" select="($restrictions/xs:whiteSpace/@value ! lower-case(normalize-space(string(.))))[last()]"/>
        <xsl:sequence select="
            if ($mode = 'replace')
            then replace($value,'[	
]',' ')
            else if ($mode = 'collapse')
            then normalize-space(replace($value,'[	
]',' '))
            else $value"/>
    </xsl:function>

    <xsl:function name="xsdh:resolved-base-type" as="xs:string">
        <xsl:param name="schema-doc" as="document-node()?"/>
        <xsl:param name="type-local" as="xs:string"/>
        <xsl:param name="visited" as="xs:string*"/>
        <xsl:variable name="simple-type" as="element(xs:simpleType)?" select="$schema-doc/xs:schema/xs:simpleType[@name = $type-local][1]"/>
        <xsl:sequence select="
            if (empty($simple-type) or $type-local = '' or $type-local = $visited)
            then $type-local
            else
                let $base-lexical := normalize-space(string($simple-type/xs:restriction[1]/@base)),
                    $base-local := xsdh:local-type-name($base-lexical)
                return
                    if ($base-lexical = '' or starts-with(lower-case($base-lexical),'xs:') or starts-with(lower-case($base-lexical),'xsd:'))
                    then $base-lexical
                    else xsdh:resolved-base-type($schema-doc,$base-local,($visited,$type-local))"/>
    </xsl:function>

    <xsl:function name="xsdh:restriction-chain" as="element(xs:restriction)*">
        <xsl:param name="schema-doc" as="document-node()?"/>
        <xsl:param name="type-local" as="xs:string"/>
        <xsl:param name="visited" as="xs:string*"/>
        <xsl:variable name="simple-type" as="element(xs:simpleType)?" select="$schema-doc/xs:schema/xs:simpleType[@name = $type-local][1]"/>
        <xsl:variable name="restriction" as="element(xs:restriction)?" select="$simple-type/xs:restriction[1]"/>
        <xsl:variable name="base-lexical" as="xs:string" select="normalize-space(string($restriction/@base))"/>
        <xsl:variable name="base-local" as="xs:string" select="xsdh:local-type-name($base-lexical)"/>
        <xsl:sequence select="
            if (empty($simple-type) or empty($restriction) or $type-local = '' or $type-local = $visited)
            then ()
            else if (starts-with(lower-case($base-lexical),'xs:') or starts-with(lower-case($base-lexical),'xsd:'))
            then $restriction
            else (xsdh:restriction-chain($schema-doc,$base-local,($visited,$type-local)),$restriction)"/>
    </xsl:function>

    <xsl:function name="xsdh:local-type-name" as="xs:string">
        <xsl:param name="qname-lexical" as="xs:string?"/>
        <xsl:variable name="raw" as="xs:string" select="normalize-space(string($qname-lexical))"/>
        <xsl:sequence select="if (contains($raw,':')) then substring-after($raw,':') else $raw"/>
    </xsl:function>

</xsl:stylesheet>
