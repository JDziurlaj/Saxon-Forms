<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:xs="http://www.w3.org/2001/XMLSchema"
    xmlns:xforms="http://www.w3.org/2002/xforms"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:xsd="http://www.w3.org/2001/XMLSchema"
    exclude-result-prefixes="xs xforms xsi xsd"
    version="3.0">
    
    <xsl:include href="../src/xforms-function-library.xsl"/>
    
    <xsl:template name="xsl:initial-template">
        <xsl:variable name="doc" as="document-node()">
            <xsl:document>
                <root xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
                    <n xml:id="a" name="Node-A">a</n>
                    <n xml:id="b" name="Node-B">b</n>
                    <n xsi:type="xsd:ID" name="Node-C">c</n>
                </root>
            </xsl:document>
        </xsl:variable>
        
        <xsl:variable name="root" as="element()" select="$doc/*"/>
        <xsl:variable name="res-2arg" as="node()*" select="xforms:id('a b c', $root)"/>
        
        <xsl:message>2-arg count=<xsl:value-of select="count($res-2arg)"/> names=<xsl:value-of select="string-join($res-2arg/@name, ',')"/></xsl:message>
        <xsl:sequence select="count($res-2arg)"/>
    </xsl:template>
</xsl:stylesheet>
