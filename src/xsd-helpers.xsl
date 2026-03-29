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
        <xsl:variable name="type" as="xs:string" select="xsdh:canonical-type($binding-type)"/>
        <xsl:variable name="value" as="xs:string" select="normalize-space(string($raw-value))"/>
        <xsl:sequence select="
            if ($type = '')
            then true()
            else if ($value = '')
            then ($type != 'nonemptystring')
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
            else if ($type = 'nonemptystring')
            then string-length($value) gt 0
            else true()"/>
    </xsl:function>

</xsl:stylesheet>
