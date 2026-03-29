<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:xs="http://www.w3.org/2001/XMLSchema"
    xmlns:xsdh="http://saxonica.com/ns/xsd-helpers"
    exclude-result-prefixes="xs xsdh"
    version="3.0">

    <xsl:output method="xml" indent="yes"/>
    <xsl:include href="../src/xsd-helpers.xsl"/>

    <xsl:template match="/">
        <xsl:variable name="canonical-failures" as="element(failure)*">
            <xsl:for-each select="/cases/canonical-case">
                <xsl:variable name="actual" as="xs:string" select="xsdh:canonical-type(@input)"/>
                <xsl:if test="$actual ne string(@expected)">
                    <failure kind="canonical" id="{@id}" input="{@input}" expected="{@expected}" actual="{$actual}"/>
                </xsl:if>
            </xsl:for-each>
        </xsl:variable>

        <xsl:variable name="validity-failures" as="element(failure)*">
            <xsl:for-each select="/cases/validity-case">
                <xsl:variable name="expected" as="xs:boolean" select="@expected = 'true'"/>
                <xsl:variable name="actual" as="xs:boolean" select="xsdh:is-type-valid(@type,string(value))"/>
                <xsl:if test="$actual ne $expected">
                    <failure kind="validity"
                        id="{@id}"
                        type="{@type}"
                        expected="{@expected}"
                        actual="{if ($actual) then 'true' else 'false'}"
                        value="{string(value)}"/>
                </xsl:if>
            </xsl:for-each>
        </xsl:variable>

        <xsl:variable name="failures" as="element(failure)*" select="$canonical-failures, $validity-failures"/>
        <xsl:choose>
            <xsl:when test="exists($failures)">
                <xsl:message terminate="yes">
                    <xsl:text>xsd helper test failures (</xsl:text>
                    <xsl:value-of select="count($failures)"/>
                    <xsl:text>):</xsl:text>
                    <xsl:for-each select="$failures">
                        <xsl:text>&#10; - </xsl:text>
                        <xsl:value-of select="@kind"/>
                        <xsl:text> </xsl:text>
                        <xsl:value-of select="@id"/>
                        <xsl:text> expected=</xsl:text>
                        <xsl:value-of select="@expected"/>
                        <xsl:text> actual=</xsl:text>
                        <xsl:value-of select="@actual"/>
                        <xsl:if test="@type">
                            <xsl:text> type=</xsl:text>
                            <xsl:value-of select="@type"/>
                        </xsl:if>
                        <xsl:if test="@input">
                            <xsl:text> input=</xsl:text>
                            <xsl:value-of select="@input"/>
                        </xsl:if>
                        <xsl:if test="@value">
                            <xsl:text> value=</xsl:text>
                            <xsl:value-of select="@value"/>
                        </xsl:if>
                    </xsl:for-each>
                </xsl:message>
            </xsl:when>
            <xsl:otherwise>
                <results
                    canonical-tests="{count(/cases/canonical-case)}"
                    validity-tests="{count(/cases/validity-case)}"
                    failures="0"/>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>

</xsl:stylesheet>
